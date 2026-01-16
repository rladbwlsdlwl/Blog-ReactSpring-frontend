import axios from 'axios';
import { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { AuthContext } from '../context/AuthProvider';
import { urlpath } from '../utils/apiUtils';
import { Link } from 'react-router-dom';
import "../css/common.css"
import "../css/Home.css"
import qs from "qs"
import GoodsComment from './common/GoodsComment';
import { getFileUrl } from '../utils/commonUtils';

export default function Home(){
    /*
        OAuth 간편로그인시, 리다이렉트 쿼리스트링 비우기
    */
    const queryParser = new URLSearchParams(window.location.search)
    const token = queryParser.get("token")

    /*
        header authentication load, set
    */
    const {gettingToken, settingToken, gettingUserId} = useContext(AuthContext)

    // 리다이렉션 후 token 노출 방지
    function settingUrlQueryParam(token){
        settingToken(token)
        window.history.replaceState({}, document.title, window.location.pathname)
    }

    const url = urlpath
    const [board, setBoardList] = useState([])
    const [previewFile, setPreviewFile] = useState([])
    const [likes, setLikes] = useState({})
    const [comments, setComments] = useState({})


    // 무한 스크롤 
    let page = 0 // querystring
    const scrollRef = useRef(null) // 스크롤 영역 참조 및 이벤트 발생



    const lastElementRef = useCallback(node => {

        if(scrollRef.current)
            scrollRef.current.disconnect()

        // 변경 감지
        const cb = (entries) => {
            if(entries[0].isIntersecting){
                console.log("이벤트 탐지! 데이터를 불러옵니다")

                page++
                getAllDataList()
            }
        }
    
        scrollRef.current = new IntersectionObserver(cb, {threshold: 0.5})
    

        // 이벤트 등록
        if(node){
            scrollRef.current.observe(node)
        }

    }, [])

    // load data
    useEffect(() => {
        
        getAllDataList()

        if(token != undefined){
            settingUrlQueryParam(token)
        }


        return () => {
            // preview File 메모리 해제
            // previewFile.map(f => URL.revokeObjectURL(f))
        }
    }, [])


    function getAllDataList(){
        
        readBoardList().then((code) => {
        
            console.log(`success to read data, RESPONSE CODE: ${code}`)
        
        }).catch(err => {

            console.log(`failed to load data - ${err}`)

        })

    }

    // 게시글 읽기
    async function readBoardList(){
        const query = {"lastId": page}

        const res = await axios.get(url, {params: query})

        const data = res.data
        setBoardList(prev => {
            console.log(prev, data)    
            
            return [...prev, ...data]
        })


        // 파일 불러오기
        // 좋아요 불러오기
        // 댓글 불러오기
        const boardIdList = data.map(d => d.id)
        
        // 동시호출, 비동기식, 병렬처리
        await Promise.all([
            readFileList(boardIdList),
            readLikesList(boardIdList),
            readCommentsList(boardIdList)
        ])

        /*
        await readFileList(boardIdList, usernameList)
        await readLikesList(boardIdList)
        await readCommentsList(boardIdList)
        */

        return res.status
    }

    // 파일 읽기
    async function readFileList(boardIdList){
        const urlfile = url + "/username/file"
        const query = {
            postIdList: boardIdList
        }

        const res = await axios.get(urlfile, {params: query, paramsSerializer: params => qs.stringify(params, {arrayFormat: "repeat"})})

        const data = res.data
        // console.log(data)
        

        setPreviewFile([...previewFile, ...data])
    }

    // 좋아요 읽기
    async function readLikesList(boardIdList){
        const urllikes = url + "/likes" 
        const query = {
            boardId: boardIdList
        }

        const res = await axios.get(urllikes, {params: query, paramsSerializer: params => qs.stringify(params, {arrayFormat: "repeat"})})

        const data = res.data
        // console.log(data)

        setLikes([...likes , ...data])
    }
    
    // 댓글 읽기
    async function readCommentsList(boardIdList){
        const urlcomments = url + "/comments"
        const param = {
            boardId: boardIdList
        }

        const res = await axios.get(urlcomments, {params: param, paramsSerializer: params => qs.stringify(params, {arrayFormat: "repeat"})})
        const data = res.data
    
        setComments([...comments, ...data])
    }



    return (
        <div className = "homeContainer">
            <BoardList 
                board = {board} 
                previewFile = {previewFile}
                likes = {likes}
                comments = {comments}
                lastElementRef = {lastElementRef}
            />
        </div>
    )
}

const BoardTemplate = ({title, contents, username, id, previewFile, likeslist, commentslist}) => {
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
                                    <img src = {previewFile} className='boardTemplateImg'/>
                                </div> 
                            </div>
                        </Link>
                    </div>
                    <div className="boardTemplateFooter">
                        <Link to = {boardpath}>
                            <GoodsComment
                                likeslist = {likeslist}
                                commentslist = {commentslist}
                            />
                        </Link>
                    </div>
                </div>
                <hr />
        </div>
    
    )
}


const BoardList = ({board, previewFile, likes, comments, lastElementRef}) =>{
    function getPreviewFile(postId){
        for(let prevFile of previewFile){
            if(prevFile.postId == postId) return prevFile.file
        }

        return ""
    }

    return (
        <table className='boardListTableContainer'>
            <thead />
            <tbody>
            {
                board.map((data, index) => <tr ref = { (index == board.length - 1)? lastElementRef: null  }><td>
                    <BoardTemplate 
                        title = {data.title}
                        contents = {data.contents}
                        username = {data.username}
                        id = {data.id}
                        previewFile = {getPreviewFile(data.id)}
                        likeslist = {likes[data.id] || []}
                        commentslist = {comments[data.id] || []}

                        key = {`BOARDLIST_${index}`}
                    />
                </td></tr>)
            }
            </tbody>
        </table>
    )
}