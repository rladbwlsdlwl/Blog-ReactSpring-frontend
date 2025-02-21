import { Link, useNavigate, useParams } from "react-router-dom"
import { urlpath } from "../utils/apiUtils"
import { useContext, useEffect, useState } from "react"
import axios from "axios"
import Error from "./Error"
import { AuthContext } from "../context/AuthProvider"
import { getDateTemplate2, getErrorCode, getErrorMsg, getFileUrl, textToBlob } from "../utils/commonUtils"
import BoardList from "./common/BoardList"
import FileList from "./common/FileList"
import "../css/UserBoard.css"
import GoodsComment from "./common/GoodsComment"

export default function UserBoard(){
    const {username, id} = useParams()
    const url = urlpath + `/${username}/${id}`
    const urlfile = urlpath + `/${username}/file/${id}`
    const urllikesGET = urlpath + `/likes`
    const urllikes = urlpath + `/likes/${id}`
    const urlcommentsGET = urlpath + "/comments"


    // 활성 회원 불러오기
    const { gettingUsername, gettingUserId, getUserInfo, gettingToken, settingToken } = useContext(AuthContext)
    const [activeUserId, activeUsername, token] = [gettingUserId(), gettingUsername(), gettingToken()]


    // 데이터 로드
    const [board, setBoard] = useState({})
    const [previewFile, setPreviewFile] = useState([])
    const [likes, setLikes] = useState({})
    const [comments, setComments] = useState({})

    const [error, setError] = useState(null)


    useEffect(() => {
        // 병렬 처리 - 동시 호출
        Promise.all([
            getBoard(),
            getFileList(),
            getLikes(),
            getComments()
        ]).catch(err => {
            console.log(err)

            const code = getErrorCode(err)
            const errmsg = getErrorMsg(err)
            setError({
                status: code, 
                message: errmsg
            })
        })


        return () => {
            // 이미지 파일 메모리 해제
            previewFile.map(prevFile => URL.revokeObjectURL(prevFile.file))
        }
    }, [])

    // 댓글 불러오기
    async function getComments() {
        const param = {
            boardId: id
        }

        const res = await axios.get(urlcommentsGET, {params: param})
        const data = res.data

        // console.log(data)
        setComments(data)
    }

    // 좋아요 불러오기
    async function getLikes(){
        const query = {
            boardId: id 
        }

        const res = await axios.get(urllikesGET, {params: query})
        const data = res.data

        // console.log(data)
        setLikes(data)
    }

    // 이미지 파일 불러오기
    async function getFileList(){
        const res = await axios.get(urlfile)
        const data = res.data

        setPreviewFile(data.map(f => {
            return {
                file: getFileUrl(f.file),
                originalFilename: f.originalFilename
            }
        }))
    }


    // 게시판 불러오기
    async function getBoard(){
        const res = await axios.get(url)
        const data = res.data

        setBoard(data)
    }



    if(error){
        return (
            <Error 
                status = "400"
                message = "잘못된 접근입니다"
            />
        )
    }else{
        return (
        <div className = "userBoardContainer">
            { 
                // 내 글 설정 
                activeUsername == username && 
                <PostToolBar 
                    activeUsername={activeUsername}
                    id = {id}
                    urlBoardDelete = {url}
                    urlFileDelete = {urlfile}
                    token = {token}
                    settingToken = {settingToken}
                    getErrorCode = {getErrorCode}
                    getErrorMsg = {getErrorMsg}
                />
            }
            
            <FileList 
                previewFile = {previewFile}
                disabled = {true}
            />

            <BoardOption
                board = { Object.keys(board).length == 0 ? null: board }
                username = {username}
            />

            <BoardList 
                board = {board}
                disabled = {true}
            />

            <GoodsComment
                likeslist = {likes[id] || []}
                commentslist = {comments[id] || []}
                getUserInfo = {getUserInfo}
                token = {token} 
                username = {username}
                urllikes = {urllikes} 
                urlcomments = {urlcommentsGET}
                activeUserId = {activeUserId}
                activeUsername = {activeUsername}
                id = {id}
            />

        </div>
        
    )}
    
}

const PostToolBar = ({activeUsername, id, urlBoardDelete, urlFileDelete, token, settingToken, getErrorCode, getErrorMsg}) => {
    const navigate = useNavigate()

    // setting button
    const [openPost, setOpenPost] = useState(false)


    function handleDeletePost(e){
        
        const selectedOk = window.confirm("삭제하시겠습니까?")
 
        if(selectedOk){

            deleteBoard().then(() => {

                navigate(`/${activeUsername}`)

            }).catch(err => {
                console.log(err)
                const code = getErrorCode(err)

                if(code == 401){ // 토큰만료 or 권한 없음
                    settingToken("")
                }

                const msg = getErrorMsg(err)

                window.alert(`삭제에러! - ${msg}`)
        
            })

        }
    }

    async function deleteBoard(){
        const header = {
            Authentication: token
        }

        await axios.delete(urlBoardDelete, {headers: header})
        await axios.delete(urlFileDelete, {headers: header})
    }



    return (
        <div className = "postToolbarContainer">
            <div className = "postToolbarSettingBtnContainer">
                <button className="postToolbarSettingBtn" onClick = {(e) => setOpenPost(!openPost)}> ⚙️ </button>
            </div>
            
            {
                openPost && <div>
                    <div className="postToolbarSettingBtnOpen">
                        <Link to = {`/${activeUsername}/new?type=update&id=${id}`} className="link"> 수정 </Link>
                    </div>
                    <div className="postToolbarSettingBtnOpen">
                        <Link onClick = {handleDeletePost} className="link" > 삭제 </Link>
                    </div>
                </div>
            }
        </div>
    )
}

const BoardOption = ({ board, username }) => {

    return (
        <div className="boardOption">
            <Link className="boardOptionL link" to = {`/${username}`}>
                { username }
            </Link>
            <span>
                { board && getDateTemplate2(board.created_at) }에 작성한 글입니다
            </span>
            
        </div>
    )
}