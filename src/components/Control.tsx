import React from "react";
import { Button } from 'antd';
import EventBus from '@/utils/EventBus';

export default class Control extends React.Component {
  state = {
    buttonData : [
      {"type":"create", "text":"生成新数独"},
      {"type":"reload", "text":"恢复初始状态"},
      {"type":"back", "text":"回退"}
    ]
  }
  handleClick = (type:string) => {    
    EventBus.emit('controlEvent', type);
  };
  render() {
    return (
      <div>
        {this.state.buttonData.map((item, index) => {
          return <Button className="control-btn" key={index} size="large" type="primary" onClick={ () => this.handleClick(item.type) }>{item.text}</Button>
        })}
      </div>
    );
  }
};