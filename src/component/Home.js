import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthProvider';
import { urlpath } from '../utils/apiUtils';
import { Link } from 'react-router-dom';
import "../css/common.css"
import "../css/Home.css"
import qs from "qs"
import { byteToBase64, getErrorCode, getErrorMsg } from '../utils/commonUtils';

export default function Home(){
    /*
        OAuth 간편로그인시, 리다이렉트 쿼리스트링 비우기
    */
    const queryParser = new URLSearchParams(window.location.search)
    const token = queryParser.get("token")

    /*
        header authentication load, set
    */
    const {gettingToken, settingToken, gettingUserId, getUserInfo} = useContext(AuthContext)

    // 리다이렉션 후 token 노출 방지
    function settingUrlQueryParam(token){
        settingToken(token)
        window.location.href = "http://localhost:3000"
    }

    const url = urlpath
    const [board, setBoardList] = useState([])
    const [previewFile, setPreviewFile] = useState([])
    const [likes, setLikes] = useState({})

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
        // 좋아요 불러오기
        const boardIdList = data.map(d => d.id)
        const usernameList = data.map(d => d.username)
        await readFileList(boardIdList, usernameList)
        await readLikesList(boardIdList)

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

    // 좋아요 읽기
    async function readLikesList(boardIdList){
        const urllikes = url + "/likes" 
        const query = {
            boardId: boardIdList
        }

        const res = await axios.get(urllikes, {params: query, paramsSerializer: params => qs.stringify(params, {arrayFormat: "repeat"})})

        const data = res.data
        console.log(data)
        setLikes(data)
    }


    return (
        <div className = "homeContainer">
            <BoardList 
                board = {board} 
                previewFile = {previewFile}
                likes = {likes}
                
                activeUserId = {gettingUserId()}
                getUserInfo = {getUserInfo}
                token = {gettingToken()}
                url = {url}
            />
        </div>
    )
}

const BoardTemplate = ({title, contents, username, id, previewFile, likes_size, already_likes, getUserInfo, token, url, activeUserId}) => {
    const boardpath = `${username}/${id}`
    const userpath = `${username}`


    const [likesBtn, setLikesBtn] = useState(already_likes)


    function handleLikesBtn(e){
        submitLikesBtn(!likesBtn).then((code) => {
            
            console.log(code)
        
        }).catch(err => {
            console.log(err)
            const code = getErrorCode(err)

            if(code == 401){ // UNAUTHORIZED 토큰 권한 만료!
                getUserInfo()
            }

            const msg = getErrorMsg(err)
            console.log(msg)

        })

        console.log("버튼 클릭!!")
        setLikesBtn(!likesBtn)
    }

    async function submitLikesBtn(isPostLike){
        const header = {
            "Authentication": token
        }
        const query = {
            userId: activeUserId
        }

        const postData = {
            boardId: id,
            author: activeUserId
        }

        const urllikes = url + `/likes/${id}`

        if(isPostLike){

            const res = await axios.post(urllikes, postData, {headers: header})

            const data = res.data
            
            return res.status

        }else{

            const res = await axios.delete(urllikes, {headers: header, params: query})
            
            return res.status

        }
    }

    function getLikesSize(likesBtn, likes_size){
        if(already_likes){ // 활성회원이 이미 좋아요를 누른 경우
            return likesBtn ? likes_size: likes_size - 1
        }else{ // 활성회원이 이전에 좋아요를 누르지 않은 경우
            return likesBtn ? likes_size + 1: likes_size
        }

    }

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
                                <div>
                                    <img src = {previewFile} className='boardTemplateImg'/>
                                </div>
                                
                                </div>
                        </Link>
                    </div>
                    <div>
                        {
                            activeUserId != undefined ?
                                <div> 
                                    <button onClick = {handleLikesBtn} disabled = {activeUserId == undefined} className = 'boardTemplateFooterBtn'>
                                        { likesBtn ? <span>❤️</span>: <span>🤍</span> } 좋아요 { getLikesSize(likesBtn, likes_size) }
                                    </button>
                                    <span className = 'boardTemplateFooterBtn'>💬 댓글 3</span>
                                </div>:
                                <div> 
                                <span className = 'boardTemplateFooterBtn'>🤍 좋아요 {likes_size}</span>
                                <span className = 'boardTemplateFooterBtn'>💬 댓글 3</span>
                            </div>
                            
                        }
                    </div>
                </div>
                <hr />
        </div>
    
    )
}


const BoardList = ({board, previewFile, likes, activeUserId, getUserInfo, token, url}) =>{
    function getPreviewFile(postId){
        const data =  previewFile.filter(data => data.postId == postId)

        return byteToBase64(data.map(d => d.file))
    }

    function getAlreadyLikes(data){
        // [{boardId, author}, ...]
        for(let likes of data){
            if(likes.author == activeUserId) return true
        }

        return false
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
                        likes_size = {likes[data.id].length}
                        already_likes = {getAlreadyLikes(likes[data.id])}
                        getUserInfo = {getUserInfo}
                        token = {token}
                        url = {url}
                        activeUserId = {activeUserId}

                        key = {`BOARDLIST_${index}`}
                    />
                </td></tr>)
            }
            </tbody>
        </table>
    )
}