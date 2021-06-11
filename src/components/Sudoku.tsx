import React from "react";

import 'antd/dist/antd.css'; 
import { Input, AutoComplete, message } from 'antd';

import EventBus from '@/utils/EventBus';
import {SudokuCore, SudokuGetNumbers} from './Sudoku_core';

interface stateData{
	sudokuList:number[][],
  sudokuListBackup:number[][],
  sudokuInputCount:number,
  numbers:number[],
  canUseNumber:number[],
  userWriteNumber:object[],
  userData:{
    [key:string]:{
      [key:string]:{
        answer:number,
        write:number,
        error:boolean
      }
    }
  }
}

export default class Sudoku extends React.Component {

  state:stateData = {
    sudokuList: [],
    sudokuListBackup:[],
    sudokuInputCount:50,
    numbers:SudokuGetNumbers(),

    canUseNumber:[],
    userWriteNumber:[],
    userData:{}
  }

  // private userData:any = {}

  initSudokuList = async () => {
   
    let resData:number[][] = await SudokuCore();

    this.setState({
      sudokuList: resData,
      sudokuListBackup:JSON.parse(JSON.stringify(resData)),
      userData:{},
      userWriteNumber:[],
      canUseNumber:[]
    });
    this.makeNumberQuestion(resData);
  }

  resetSudokuList = () => {
    let userData = this.state.userData
    for(let row in this.state.userData){
      for(let col in this.state.userData[row]){
        userData[row][col].write = 0;
        userData[row][col].error = false;
      }
    }
    this.setState({
      userWriteNumber:[],
      userData
    });
  }

  backSudokuList = () => {
    if(this.state.userWriteNumber.length===0){
      message.error({
        content: '已经到墙边,没得退了',
        className: 'custom-class',
        style: {
          marginTop: '30vh',
        },
      });
      this.resetSudokuList();
    }else{
      let {rowIdx,colIdx,value,oldValue} = Object.assign(this.state.userWriteNumber.pop()||{}) ;
      if(rowIdx&&colIdx){
        this.inputOnChange(rowIdx, colIdx, oldValue)
      }
      
    }
  }

  makeNumberQuestion = (data:number[][]) => {
    
    let rowsLength = data.length;
    let columnsLength = data[0].length;
    let totalNumber = rowsLength * columnsLength;
    
    let userData = this.state.userData;
    //随机挑选数字，在渲染时隐藏
    for(let i=0;i<this.state.sudokuInputCount;i++){
      let chooseOne = Math.floor((Math.random() * totalNumber));
      let row = Math.floor(chooseOne/rowsLength);
      let col = chooseOne%columnsLength;

      if(!userData[row]){
        userData[row] = {};
      }
      
      userData[row][col] = {
        answer:data[row][col],
        write:0,
        error:false
      };
    }

    this.setState({userData});
  }


  controlEvent = (type:string) => {
    switch(type){
      case "create":
        this.initSudokuList();
      break;
      case "reload":
        this.resetSudokuList();
      break;
      case "back":
        this.backSudokuList();
      break;
    }
  }
  //发布订阅模式在模块间传递数据有优势
  componentDidMount(){
    EventBus.addListener("controlEvent", this.controlEvent);
    this.initSudokuList();
  }
  componentWillUnmount(){
    EventBus.removeListener("controlEvent", this.controlEvent);
  }
  inputOnFocus(rowIdx:number, colIdx:number){

    //获取列展示的数值
    let colsNumber = this.state.sudokuList.map((row,idx)=>{
      let colData = this.state.userData[idx][colIdx];
      if(!colData){
        return row[colIdx];
      }else if(colData.write>0){
        return colData.write;
      }else{
        return null;
      }
    }).filter((el)=>{
      return typeof el == "number";
    });
   
    //获取行展示的数值
    let rowNumber = this.state.sudokuList[rowIdx].map((el,idx)=>{
      let rowData = this.state.userData[rowIdx][idx];
      if(!rowData){
        return el;
      }else if(rowData.write>0){
        return rowData.write;
      }else{
        return null;
      }
    }).filter((el)=>{
      return typeof el == "number";
    });
    
    //合并计算哪些数可以用
    let canUseNumber = this.state.numbers.filter((el)=>{
      return !colsNumber.concat(rowNumber).includes(el);
    });
    
    this.setState({
      canUseNumber
    });

    if(canUseNumber.length===0){
      message.error({
        content: '数字用完啦',
        className: 'custom-class',
        style: {
          marginTop: '30vh',
        },
      });
    }
  
  }
  inputOnChange(rowIdx:number, colIdx:number, value:number){
    
    let userData = this.state.userData;

    if(!this.state.numbers.includes(value)){
      userData[rowIdx][colIdx].write = 0;
      userData[rowIdx][colIdx].error = false;
      this.setState({userData});
      return;
    }

    //检测用户是否输入错误
    if(value>0&&!this.state.canUseNumber.includes(value)){
      userData[rowIdx][colIdx].error = true;
    }else{
      userData[rowIdx][colIdx].error = false;
    }

    userData[rowIdx][colIdx].write = value;
    this.setState({userData});

  }
  //记录删除事件
  handleKeyDown(ev:any, rowIdx:number, colIdx:number){
    if(ev.keyCode===8){
      this.recoderUserData(rowIdx,colIdx,0);
      this.inputOnChange(rowIdx, colIdx,0);
    }
  }
  //记录用户填写内容
  recoderUserData(rowIdx:number, colIdx:number, value:number){
    let userWriteNumber = this.state.userWriteNumber;
    
    let oldValue = this.state.userData[rowIdx][colIdx]?.write;

    userWriteNumber.push({
      rowIdx,
      colIdx,
      value,
      oldValue
    });

    this.setState((userWriteNumber));
  }

  render() {
    const options = this.state.canUseNumber.length>0 ? this.state.canUseNumber.map((el)=>{
      return {
        label:el,
        value:el.toString()
      }
    }) : [{lable:"数字用完啦",value:""}];
    

    const getValue = (rowIdx:number, colIdx:number):string => {
      return this.state.userData[rowIdx][colIdx].write>0?this.state.userData[rowIdx][colIdx].write.toString():""
    }

    const checkColumn = (rowIdx:number, colIdx:number) => {
      return this.state.userData[rowIdx]&&this.state.userData[rowIdx][colIdx];
    }

    const checkValue = (rowIdx:number, colIdx:number) => {
      return this.state.userData[rowIdx][colIdx].error;
    }

    return (
      <div className="sudoku-box">
        {this.state.sudokuList.map((col,rowIdx) => (
          <div className="sudoku-row" key={rowIdx}>
            
            {col.map((data,colIdx)=>(
              <div key={`${rowIdx}-${colIdx}`} className="sudoku-col">
                { checkColumn(rowIdx, colIdx) ?(
                  <AutoComplete
                    dropdownClassName="certain-category-search-dropdown"
                    onChange={(value)=>{
                      this.recoderUserData(rowIdx, colIdx, parseInt(value));
                      this.inputOnChange(rowIdx, colIdx, parseInt(value));
                    }} 
                    value={getValue(rowIdx,colIdx)}
                    style={{
                      width: "100%",
                    }}
                    options={options}
                  >
                    <Input
                      onClick={(e)=>{e.currentTarget.select()}}
                      onKeyDown={(e)=>this.handleKeyDown(e,rowIdx,colIdx)}
                      className={checkValue(rowIdx,colIdx)?'sudoku-error':''}
                      onFocus={() => {
                        this.inputOnFocus(rowIdx, colIdx) 
                      }} 
                      
                    />
                  </AutoComplete>
                ):<span className="sudoku-number">{data}</span>}
                <span className="sudoku-col-mask"></span>
              </div>
            ))}
          
          </div>
        ))}
      </div>
    );
  }
};
