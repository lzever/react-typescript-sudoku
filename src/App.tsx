import React from "react";
import './App.css';
import Config from './Config';
import Header from "./components/Header";
import Sudoku from "./components/Sudoku";
import Control from "./components/Control";
import Footer from "./components/Footer";

export default class App extends React.Component {
  state = {
    config: Config
  };
  render() {
    return (
      <div className="App">
        <Header title={this.state.config.title}></Header>
        <Sudoku></Sudoku>
        <Control></Control>
        <Footer author={this.state.config.author}></Footer>
      </div>
    );
  }
}
