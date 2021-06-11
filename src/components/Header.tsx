import React from "react";

interface Props {
  title: string;
}

const Header: React.SFC<Props> = (props: Props) => {
  return (
    <header className="sudoku-header">
      <h1>{props.title}</h1>
    </header>
  );
};

export default Header;