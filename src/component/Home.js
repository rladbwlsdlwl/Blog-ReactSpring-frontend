import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { HttpHeaderContext } from '../context/HttpHeaderProvider';


export default function Home(){
    /*
        OAuth 간편로그인시, 리다이렉트 쿼리스트링 비우기
    */
    const queryParser = new URLSearchParams(window.location.search)
    const token = queryParser.get("token")

    /*
        header authentication load, set
    */
    const {gettingToken, settingToken} = useContext(HttpHeaderContext)

    // 리다이렉션 후 token 노출 방지
    function settingUrlQueryParam(token){
        settingToken(token)
        window.location.href = "http://localhost:3000"
    }

    const url = "http://localhost:8080/api"
    const [board, setBoardList] = useState([])

    useEffect(() => {
        readBoardList()
        if(token != undefined){
            settingUrlQueryParam(token)
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

const BoardTemplate = ({title, contents}) => {
    return (
        <div>
            <p>{title}</p>
            <p>{contents}</p>
        </div>
    )
}


const BoardList = ({board}) =>{
    function showBoardList(){
        return board.map((data, index) => {
            return <BoardTemplate 
                title = {data.title}
                contents = {data.contents}
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