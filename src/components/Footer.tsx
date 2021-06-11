import React from "react";

interface Props {
  author: string;
}

const Footer: React.SFC<Props> = (props: Props) => {
  return (
    <footer>
      <div>Create by {props.author}</div>
    </footer>
  );
}

export default Footer;