interface stateData{
	safeLength:number,
  sudokuStartTime:number,
  sudokuRestartCount:number,
}

const state:stateData = {
  safeLength:10, //numbers长度等于小于这个值可以快速计算，大于这个值计算时间将几何倍数增长
  sudokuStartTime:0,
  sudokuRestartCount:0
}

const numbers: Array<number> = [1,2,3,4,5,6,7,8,9];

const randomNumber = (numberArray:number[]) => {
  return Math.floor((Math.random() * numberArray.length));
}

const SudokuInit = (resolve:any) => {

  let rows:number = numbers.length;
  let columns:number = numbers.length;
  let resultData:number[][] = [];

  for(let i=0;i<rows;i++){
    
    let copyNumbers = numbers.slice();
    let rowNumbers:number[] = [];

    //开始计算
    for(let j=0;j<columns;j++){
      
      let allUseNumbers:number[] = [];
      if(i>0){
        
        for(let k=0;k<i;k++){
          //分治思维,用过的数字暂时从候选列表中删除，缓存起来
          let idx = copyNumbers.indexOf(resultData[k][j]);
          if(idx>-1){
            allUseNumbers.push(copyNumbers.splice(idx,1)[0]);
          }
          
        }
      }
      
      let num = copyNumbers.splice(randomNumber(copyNumbers),1)[0];
      if(typeof num == "number"){
        rowNumbers.push(num);
      }else{
        //资源分配方式有误就重新分配
        //console.log("restart"); //使用log会明显的影响计算效率
        //如果大于11格,暴力破解会触发浏览器保护机制,设置安全值解决RangeError: Maximum call stack size exceeded
        //触发机制将计算放入宏任务队列避免栈溢出
        state.sudokuRestartCount++;
        if(rows>state.safeLength&&state.sudokuRestartCount>state.safeLength){
          setTimeout(()=>{
            state.sudokuRestartCount=0;
            SudokuInit(resolve);
          }, 0);
        }else{
          SudokuInit(resolve);
        }
        
        return false;
      }
      
      if(i>0){
        //循环计算下一列前将缓存的数字恢复
        copyNumbers = copyNumbers.concat(allUseNumbers);
      }
      
    }
    
    resultData.push(rowNumbers);

  }
  console.log("计算所花时间(毫秒):"+(new Date().getTime()-state.sudokuStartTime));
  state.sudokuStartTime = 0;
  state.sudokuRestartCount=0;
  console.log(resultData);
  resolve(resultData);

}

export function SudokuGetNumbers(){
  return numbers;
}

export function SudokuCore(){

  return new Promise<number[][]>((resolve)=>{
    if(state.sudokuStartTime===0){
      state.sudokuStartTime = new Date().getTime();
    }
  
    SudokuInit(resolve);
  })

}