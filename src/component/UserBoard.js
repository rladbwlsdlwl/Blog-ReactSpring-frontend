import { Link, useParams } from "react-router-dom"
import { urlpath } from "../utils/apiUtils"
import { useContext, useEffect, useState } from "react"
import axios from "axios"
import Error from "./Error"
import { AuthContext } from "../context/AuthProvider"
import { byteToBase64 } from "../utils/commonUtils"
import BoardList from "./common/BoardList"
import FileList from "./common/FileList"
import "../css/UserBoard.css"

export default function UserBoard(){
    const {username, id} = useParams()
    const url = urlpath + `/${username}/${id}`
    const urlfile = urlpath + `/${username}/file/${id}`


    // 활성 회원 불러오기
    const { gettingUsername } = useContext(AuthContext)
    const activeUsername = gettingUsername()


    // 데이터 로드
    const [board, setBoard] = useState({})
    const [file, setFile] = useState([])
    const [previewFile, setPreviewFile] = useState([])

    const [error, setError] = useState(null)


    useEffect(() => {

        getBoard()
        getFileList()

    }, [])


    // 이미지 파일 불러오기
    function getFileList(){
        axios.get(urlfile).then(res => {
            const data = res.data
            console.log(data)
            
            setFile(data.map(data => {
                return {
                    name: data.originalFilename,
                    ...data
                }
            }))
            setPreviewFile(data.map(data => byteToBase64(data.file)))
        }).catch(err => {

            console.log(err)

        })

    }


    // 게시판 불러오기
    function getBoard(){
        axios.get(url).then(res => {
                const data = res.data 

                setBoard(res.data)
            }).catch((err) => {

                setError({
                    status: err.response.data.status, 
                    message: err.response.data.message
                })

        })
    }



    if(error){
        return (
            <Error 
                status = {error.status} 
                message = {error.message}
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
                />
            }
            
            <FileList 
                previewFile = {previewFile}
                file = {file}
                disabled = {true}
            />

            <BoardList 
                board = {board}
                disabled = {true}
            />

        </div>
        
    )}
    
}

const PostToolBar = ({activeUsername, id}) => {
    const [openPost, setOpenPost] = useState(false)

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
                        삭제
                    </div>
                </div>
            }
        </div>
    )
}