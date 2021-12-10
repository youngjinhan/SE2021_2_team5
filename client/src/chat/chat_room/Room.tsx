import React, { useState, useEffect, useRef, useContext, RefObject, SyntheticEvent } from "react";
import styles from "./Room.module.scss";
import { RouteComponentProps } from "react-router";
import { firestore, parseDocs } from "../../util/firebase";
import { TextField, IconButton } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {Message} from "./components/Message"
import {chatroomInfo, message, DocSnapshot, timeStamp} from "../../models/meta"
import moment from "moment";
import CircularProgress from "@material-ui/core/CircularProgress";
import undefined from "firebase/empty-import";

//최종 commit


interface Props extends RouteComponentProps<{ roomId: string }> {}

export const ChattingRoomPage: React.FC<Props> = (props: Props) => {

  //유저 개발전 temp
  const chat_room_temp = "gDbSnNwz24YjErMGmDC8";
  const curUser = (props.match.params.roomId === "1") ? "123456789" :"abcdefghi"
  const chatId = chat_room_temp;

  const chat_ref = firestore
    .collection('chats')
    .doc(chatId);

  const [initRoomData, setInitRoomData] = useState<chatroomInfo>();
  const [readInfo, setReadInfo] = useState<chatroomInfo>();
  const [endOfRoom, setEndofRoom] = useState<boolean>(false);
  const [isloading1, setIsLoading1] = useState<boolean>(true);
  const [isloading2, setIsLoading2] = useState<boolean>(true);


  async function loadInitRoom () {
    const doc = await chat_ref.get();
    setInitRoomData(doc.data() as any);
  }

  async function updateRoomInfo() {
    chat_ref.onSnapshot(docSnapshot => {
      setReadInfo(docSnapshot.data() as any)
    })
  }

  async function readCheck () {
    const timestamp = Date.now();
    const doc = await chat_ref.update({
      ['lastViewed.'+curUser+'.timestamp']:timestamp
    });
  }

  //자동 스크롤 관련
  const botRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrolltoBottom = () => {
    if(botRef.current) {
      botRef.current.scrollIntoView({behavior: "smooth"});
    }
  }

  const forcetoBottom = () => {
    /*
    if(containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight - containerRef.current.clientHeight;
      console.log("forced")
    }
    else{
      console.log("notfound")
    }
    */
   if(botRef.current) {
    botRef.current.scrollIntoView();
    }
  }

  //자동 스크롤 해제 관련
  const [isBottom, setIsBottom] = useState<boolean>(false);

  async function handelUserScroll(e:SyntheticEvent<HTMLDivElement>){

    const scroll = e.currentTarget.scrollHeight 
      - e.currentTarget.scrollTop
      - e.currentTarget.clientHeight;

    // test
    if(containerRef.current){
      //console.log(e.currentTarget.scrollHeight, e.currentTarget.scrollTop, e.currentTarget.clientHeight)
      //console.log(scroll)
      //console.log("window",  containerRef.current.scrollTop)
    }
    
    //stop while initial load
    if(!isloading1&&!isloading2){

      //load more
      if(containerRef.current && e.currentTarget.scrollTop === 0 && !endOfRoom){
        const pastH = containerRef.current.scrollHeight;
        const wait = await getOldMessage();
        
        if(wait){
          const newH = containerRef.current.scrollHeight;
          //console.log(newH-pastH);
          containerRef.current.scrollTop = newH-pastH;
        }
        
      }

      //set bottom
      if(scroll<30){
        setIsBottom(true);
      }

      else {
        setIsBottom(false);
      }
    }
    
  }

  function autoScroll(){
    if(isBottom){
      scrolltoBottom();
    }
  }

  const [messages, setMessages] = useState<message[]>([]);

  const [inputValue, setInputValue] = useState<string>("");

  async function sendMessage(inputValue:string){
    
    const senderUID = curUser;
    const timestamp = Date.now()

    const data:message = {
      chatId: chatId,
      senderUID: senderUID,
      content: inputValue,
      createdAt: timestamp
    }

    const doc = await chat_ref
      .collection("messages")
      .doc();

    setInputValue("");
    await doc.set(data);
    scrolltoBottom();
    readCheck();
  }

  const [oldestMessage, setOldestMessage] = useState<DocSnapshot<message>>();

  async function getOldMessage(){
    if(!oldestMessage){

      if(initRoomData) {
        const querysnapshot = await chat_ref
        .collection("messages")
        .where('createdAt', '<=', initRoomData.lastViewed[curUser].timestamp)
        .orderBy('createdAt',"desc")
        .limit(50)
        .get();

        if(!querysnapshot.docs.length){
          setIsLoading1(false);
          return;
        }

        //buffer
        let buffer: message[] = [];
        querysnapshot.forEach(doc => {
          buffer = [doc.data() as message, ...buffer];
        });
        setMessages(oldArray => [ ...buffer, ...oldArray]);
        buffer = [];

        const lastdoc = querysnapshot.docs[querysnapshot.docs.length-1];

        setOldestMessage({
          id: lastdoc.id,
          data: lastdoc.data() as any,
          raw: lastdoc
        });

        if(querysnapshot){
          forcetoBottom();
        }
        setIsLoading1(false);
      }
    }
    else {
      if(initRoomData) {
        const querysnapshot = await chat_ref
        .collection("messages")
        .where('createdAt', '<=', initRoomData.lastViewed[curUser].timestamp)
        .orderBy('createdAt',"desc")
        .startAfter(oldestMessage.raw)
        .limit(10)
        .get();

        //buffer
        let buffer: message[] = [];
        querysnapshot.forEach(doc => {
          buffer = [doc.data() as message, ...buffer];
        });
        setMessages(oldArray => [ ...buffer, ...oldArray]);
        buffer = [];

        const lastdoc = querysnapshot.docs[querysnapshot.docs.length-1]
        
        if(!lastdoc){
          setEndofRoom(true);
          return false;
        }

        setOldestMessage({
          id: lastdoc.id,
          data: lastdoc.data() as any,
          raw: lastdoc
        })
  
      }
      
    }
    setIsLoading1(false);
    return true
  }

  async function getNewMessage(){
    if(initRoomData){
      setIsLoading2(false);
      return( 
        chat_ref.collection("messages")
          .where('createdAt', '>', initRoomData.lastViewed[curUser].timestamp)
          .orderBy('createdAt')
          .onSnapshot(
             snapshot => {
              snapshot.docChanges().forEach(change => {
                if(change.type === 'added'){
                  setMessages(oldArray => [ ...oldArray, change.doc.data() as message]);
                }
              });
            },
            err => {
              alert(err);
            }
        )
      )
    }
  }

  function readCount(timestamp:timeStamp) {
    
  }
  function renderMessages() {
    let i = 0;
    let messageCount = messages.length;
    let renderedMessages = [];

    while (i < messageCount) {
      let previous = messages[i - 1];
      let current = messages[i];
      let next = messages[i + 1];
      let isMine = current.senderUID === curUser;
      let currentMoment = moment(current.createdAt);
      let curMomentTime = currentMoment.format("hh:mm");
      let curMomentDate = currentMoment.format("YYYY:MM:DD")
      let prevBySameAuthor = false;
      let nextBySameAuthor = false;
      let startSeq = true;
      let endSeq = true;
      let showDate = true;

      if (previous) {
        let previousMoment = moment(previous.createdAt);
        let prevMomentDate = previousMoment.format("YYYY:MM:DD");
        let prevMomentTime = previousMoment.format("hh:mm");
        prevBySameAuthor = previous.senderUID === current.senderUID;
        
        if (prevBySameAuthor && (prevMomentTime === curMomentTime)) {
          startSeq = false;
        }

        if (prevMomentDate === curMomentDate) {
          showDate = false;
        }
      }

      if (next) {
        let nextMoment = moment(next.createdAt);
        let nextMomentDate = nextMoment.format("YYYY:MM:DD");
        let nextMomentTime = nextMoment.format("hh:mm");
        nextBySameAuthor = next.senderUID === current.senderUID;

        if (nextBySameAuthor && (nextMomentTime === curMomentTime)) {
          endSeq = false;
        }
      }

      renderedMessages.push(
        <Message
          isMine={isMine}
          startSeq={startSeq}
          endSeq={endSeq}
          showDate={showDate}
          data={current}
        />
      );

      i += 1;
    }

    return renderedMessages;
  }


  useEffect(() => {
    loadInitRoom();
    updateRoomInfo();
  }, [])

  useEffect(() => {
    if(!initRoomData){
      return;
    }
    getOldMessage();
    getNewMessage();
  }, [initRoomData])

  // useEffect(()=>{
  //   if(!oldestMessage){
  //     return;
  //   }
  //   if(hooking){
  //     console.log("ueseffect")
  //     getOldMessage();
  //      //scrolltoBottom();
  //     forcebottom();
  //     setHooking(false);
  //   } 
  //   return;
  // },[oldestMessage])

  useEffect(() => { 
    autoScroll()
    if(readInfo){
      console.log(readInfo.lastViewed)
    }
  }, [messages]);

  return (
    <div className = {styles.test}>
      <div className = {styles.testroombox}>

        <div 
          className = {styles.messageContainer}
          onScroll={handelUserScroll}
          ref = {containerRef}
        >
          <div>
            {renderMessages()}
            <div className = {styles.margintop1} ref = {botRef}></div>
          </div>
        </div>
        
        <div className = {styles.compose}>
          <input
            className = {styles.composeinput}
            type="text"
            value = {inputValue}
            placeholder="Type a message, @name"
            onChange = {e => {
              setInputValue(e.target.value);
            }}
            onKeyPress = {e => {
              if(e.key === 'Enter'){
                sendMessage(inputValue);
              }
            }}
          />
        </div>

      </div>
    </div>
  );
};
