import React from "react";

export interface Props {
    time: Date | null;
  }
  
  export const Time: React.FC<Props> = (props: Props) => {
    const now = new Date().getTime();
    if(props.time){
      const t = props.time.getTime();
      const v = now - t;
    
      // if (v < 60 * 1000) {
      //   return <span>방금 전</span>;
      // }
    
      // if (v < 60 * 60 * 1000) {
      //   return <span>{Math.round(v / (60 * 1000))}분 전</span>;
      // }
    
      // if (v < 60 * 60 * 24 * 1000) {
      //   return <span>{Math.round(v / (60 * 60 * 1000))}시간 전</span>;
      // }
    
      return (
        <span>
          {props.time.getFullYear()}/{props.time.getMonth() + 1}/
          {props.time.getDate()} {props.time.getHours()}:{props.time.getMinutes()}
        </span>
      );
    }
    else{
      return <span>방금 전</span>;
    }
  };