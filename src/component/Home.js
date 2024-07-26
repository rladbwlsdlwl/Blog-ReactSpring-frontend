import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthProvider';
import { urlpath } from '../utils/apiUtils';
import { Link } from 'react-router-dom';
import "../css/common.css"
import "../css/Home.css"

export default function Home(){
    /*
        OAuth 간편로그인시, 리다이렉트 쿼리스트링 비우기
    */
    const queryParser = new URLSearchParams(window.location.search)
    const token = queryParser.get("token")

    /*
        header authentication load, set
    */
    const {gettingToken, settingToken} = useContext(AuthContext)

    // 리다이렉션 후 token 노출 방지
    function settingUrlQueryParam(token){
        settingToken(token)
        window.location.href = "http://localhost:3000"
    }

    const url = urlpath
    const [board, setBoardList] = useState([])

    useEffect(() => {
        console.log("mount!!")
        readBoardList()

        if(token != undefined){
            settingUrlQueryParam(token)
        }

        return () => {
            console.log("unmount!!")
        }
    }, [])

    // 게시글 읽기
    function readBoardList(){
        axios.get(url)
            .then((res) => {    
                setBoardList(res.data)
                console.log(`success to read data, RESPONSE CODE: ${res.status}`)
            }).catch((err) => {
                console.log(`failed to load data - ${err}`)
        })
    }

    return (
        <div>
            <BoardList board = {board}></BoardList>
        </div>
    )
}

const BoardTemplate = ({title, contents, username, id}) => {
    const boardpath = `${username}/${id}`
    const userpath = `${username}`
    return (
        <div className = 'boardListOuter'>
            <div style = {{"height": "100%"}}>
                <div className='boardListUsername'>
                    <Link to = {userpath} className = "link">
                        {username}
                    </Link>
                </div>
                <div className='boardListContent'>
                    <Link to = {boardpath} className = "link">
                        <div className='boardListTitle'>{title}</div>
                        <div>{contents}</div>
                    </Link>
                </div>
                
                <hr />
            </div>
        </div>
    
    )
}


const BoardList = ({board}) =>{
    function showBoardList(){
        return board.map((data, index) => {
            return <BoardTemplate 
                title = {data.title}
                contents = {data.contents}
                username = {data.username}
                id = {data.id}
                key = {`BOARDLIST_${index}`}
            />
        })

    }

    return (
        <div>
            {
                showBoardList()
            }
        </div>
    )
}