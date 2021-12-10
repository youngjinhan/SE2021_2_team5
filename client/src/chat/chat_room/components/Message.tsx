import React from "react";
import styles from "./Message.module.scss";
import { RouteComponentProps } from "react-router";
import {chatroomInfo, message} from "../../../models/meta"
import moment from "moment";

import classNames from "classnames/bind"
const cx = classNames.bind(styles);

export interface Props {
    data: message;
    isMine: boolean;
    startSeq: boolean;
    endSeq: boolean;
    showDate: boolean;
}

export const Message: React.FC<Props> = (props: Props) => {
    const friendlyDate = moment(props.data.createdAt).format('YYYY년 MM월 DD일');
    const friendlyTime = moment(props.data.createdAt).format('hh:mm a');
    
    return (
        <div className = {cx('message', {mine: props.isMine}, {others: !props.isMine})}>

        {
          props.showDate &&
            <div className={cx("date")}>
              { friendlyDate }
            </div>
        }

            <div className={cx('bubble-container')}>
                {
                    props.isMine&&
                        <div className={cx("readcount")}>
                            <div className={cx("read")}>
                                3
                            </div>
                            {
                                props.endSeq && props.isMine &&
                                    <div className={cx("time")}>
                                        { friendlyTime }
                                    </div>
                            }
                        </div>
                }

                
                <div className={cx("bubble", {start:props.startSeq}, {end:props.endSeq})}>
                    { props.data.content }
                </div>

                {
                    props.endSeq && !props.isMine &&
                        <div className={cx("time")}>
                            { friendlyTime }
                        </div>
                }

                {
                    !props.isMine &&
                    <div>1</div>
                }
            </div>

        </div>

    );
};
