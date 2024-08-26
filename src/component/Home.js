import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthProvider';
import { urlpath } from '../utils/apiUtils';
import { Link } from 'react-router-dom';
import "../css/common.css"
import "../css/Home.css"
import qs from "qs"
import { byteToBase64 } from '../utils/commonUtils';

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
    const [previewFile, setPreviewFile] = useState([])

    useEffect(() => {
        
        readBoardList().then((code) => {
        
            console.log(`success to read data, RESPONSE CODE: ${code}`)
        
        }).catch(err => {

            console.log(`failed to load data - ${err}`)

        })

        if(token != undefined){
            settingUrlQueryParam(token)
        }

    }, [])

    // 게시글 읽기
    async function readBoardList(){
        const res = await axios.get(url)

        const data = res.data

        // 파일 불러오기
        const boardIdList = data.map(d => d.id)
        const usernameList = data.map(d => d.username)
        await readFileList(boardIdList, usernameList)


        setBoardList(data)

        return res.status
    }


    // 파일 읽기
    async function readFileList(boardIdList, usernameList){
        const urlfile = url + "/username/file"
        const query = {
            postIdList: boardIdList,
            usernameList: usernameList
        }

        const res = await axios.get(urlfile, {params: query, paramsSerializer: params => qs.stringify(params, {arrayFormat: "repeat"})})

        const data = res.data
        console.log(data)
        setPreviewFile(data)
    }

    return (
        <div>
            <BoardList 
                board = {board} 
                previewFile = {previewFile}
            />
        </div>
    )
}

const BoardTemplate = ({title, contents, username, id, previewFile}) => {
    const boardpath = `${username}/${id}`
    const userpath = `${username}`

    return (<div>
                <div className = 'boardTemplateContainer'>
                    <div className='boardTemplateUsername'>
                        <Link to = {userpath} className = "link">
                            {username}
                        </Link>
                    </div>
                    <div className='boardTemplateBodyContainer'>
                        <Link to = {boardpath} className = "link">
                            <div className='boardTemplateBody'>
                                <div className='boardTemplateBodyL'>
                                    <div className='boardTemplateTitle'>{title}</div>
                                    <div className='boardTemplateContents'>{contents}</div>
                                </div>
                                <div className='boardTemplateBodyR'>
                                    <img src = {previewFile} alt = "이미지가 없습니다" className='boardTemplateImg'/>
                                </div>
                                
                                </div>
                        </Link>
                    </div>
                </div>
                <hr />
        </div>
    
    )
}


const BoardList = ({board, previewFile}) =>{
    function getPreviewFile(postId){
        const data =  previewFile.filter(data => data.postId == postId)

        return byteToBase64(data.map(d => d.file))
    }

    return (
        <table className='boardListTableContainer'>
            <thead />
            <tbody>
            {
                board.map((data, index) => <tr><td>
                    <BoardTemplate 
                        title = {data.title}
                        contents = {data.contents}
                        username = {data.username}
                        id = {data.id}

                        previewFile = {getPreviewFile(data.id)}
                        key = {`BOARDLIST_${index}`}
                    />
                </td></tr>)
            }
            </tbody>
        </table>
    )
}