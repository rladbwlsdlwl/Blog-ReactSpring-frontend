import { useContext, useEffect, useRef, useState } from "react"
import { AuthContext } from "../context/AuthProvider"
import { urlpath } from "../utils/apiUtils"
import Error from "./Error"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import axios from "axios"
import BoardList from "./common/BoardList"
import FileList from "./common/FileList"

import "../css/UserBoardCreateUpdate.css"
import { byteToBase64, getErrorCode, getErrorMsg } from "../utils/commonUtils"

export default function UserBoardCreateUpdate(){
    const { username } = useParams()
    const [URLSearchParams, SetURLSearchParams] = useSearchParams()
    const [type, id] = [URLSearchParams.get("type"), URLSearchParams.get("id")]
    
    const urlwrite = urlpath + `/${username}`
    const urlupdate = urlpath + `/${username}/${id}`
    const urlfilewrite = urlpath + `/${username}/file`
    const urlfile = urlpath + `/${username}/file/${id}`

    
    // 접속 유저 이름찾기
    // 토큰 불러오기
    const { gettingToken, settingToken, gettingUsername, gettingUserId } = useContext(AuthContext)
    const [ activeUsername, token, author ] = [gettingUsername(), gettingToken(), gettingUserId()]


    // 인풋 데이터
    const [board, setBoard] = useState({})
    const [file, setFile] = useState([])
    const [previewFile, setPreviewFile] = useState([])
    const [beforeFilenameList, setbeforeFilenameList] = useState([])


    // 에러 페이지
    const [error, setError] = useState(null)


    useEffect(() => {
        
        if(type == "write"){
            return 
        }else if(type == "update"){
            // 게시판 불러오기
            getBoardList() 
            
            // 파일 불러오기 
            getFileList()

        }else{
            setError(true)
        }

    }, [])


    // 게시판 불러오기
    function getBoardList(){
        axios.get(urlupdate).then(res => {
            const data = res.data

            setBoard(data)

        }).catch(err=>{
            console.log(err)
            setError(true)
        })
    }

     // 파일 불러오기
     function getFileList(){
        axios.get(urlfile).then(res => {
            const data = res.data
            console.log(data)

            // 바이너리 데이터 to File(Blob)
            setFile(data.map(f => new File(Array.of(f), f.originalFilename))) // 파일 등록
            setbeforeFilenameList(data.map(f => f.currentFilename)) // 기존 파일이름 등록 - 파일 중복가능 (기존파일과 비교하여 파일 등록 예정)

            // 바이너리 데이터 to Base64
            setPreviewFile(data.map(f => {
                return byteToBase64(f.file)
            }))
        }).catch(err => {

            console.log(err)
            setError(true)

        })

    }


    // console.log(username, activeUsername)
    if(username != activeUsername || error){
        return (
            <Error 
                status = "400"
                message = "잘못된 접근입니다"
            />
        )
    }

    return (
        <div className = "userBoardCreateUpdateContainer">
            <Toolbar
                board = {board}
                file = {file}
                setFile = {setFile}
                previewFile = {previewFile}
                setPreviewFile = {setPreviewFile}
                beforeFilenameList = {beforeFilenameList}

                isUpdatePost = {type == "update"}
                urlwrite = {urlwrite}
                urlupdate = {urlupdate}
                urlfilewrite = {urlfilewrite}
                token = {token}  
                username = {username}
                author = {author}

                settingToken = {settingToken}
                getErrorCode = {getErrorCode}
                getErrorMsg = {getErrorMsg}
            />

            <FileList
                file = {file}
                previewFile = {previewFile}
                setFile = {setFile}
                setPreviewFile = {setPreviewFile}
            />
            
            <BoardList 
                board = {board}
                setBoard = {setBoard}
            />
        </div>
    )
}


// 게시판 전송 및 파일 조작(File to Base64, Binary data) 컨테이너
const Toolbar = ({board, file, setFile, previewFile, setPreviewFile, beforeFilenameList, urlwrite, urlupdate, urlfilewrite, isUpdatePost, token, username, author, settingToken, getErrorCode, getErrorMsg}) => {

    const navigate = useNavigate()

    // setting - 파일 이미지 (File)
    function handlerImage(e){
        const files = Array.from(e.target.files)
        // console.log(files)
        

        // File to Base64
        // 파일을 이진데이터 텍스트로 변환 - FileReader의 readAsDataURL
        updatePreviewImage(files)
        
        setFile([...file, ...files])
    }


    // setting - 파일 미리보기 이미지 
    function updatePreviewImage(files){
        
        files.forEach(f => {
            const reader = new FileReader()
            reader.onload = (e) => {
                const imglink = e.target.result
                // console.log(imglink)
                setPreviewFile((prev) => [...prev, imglink])
            }


            reader.readAsDataURL(f)
        })

    }

    // 게시글 작성 핸들러
    function handleSubmitPost(){
        
        postBoard().then((res) => {
            const boardId = res
            
            navigate(`/${username}/${boardId}`)


        }).catch(err => {

            console.log(err)
            
            const code = getErrorCode(err)
            if(code == 401){ // 토큰 만료 - JWT EXPIRED
                settingToken("")
            } 

            const msg = getErrorMsg(err)
            alert(`게시판 작성 에러 - ${msg}`)
        })
    }

    // 게시글 작성
    async function postBoard(){
        const header = {
            "Authentication": token
        }

        const postData = {
            ...board, 
            author: author
        }

        if(isUpdatePost){
            // patch

            const res = await axios.patch(urlupdate, postData, {headers: header})
            const data = res.data
            
            console.log(data)

            await submitPostFile(data.id, isUpdatePost)

            return data.id
            
        }else{
            // post
            
            const res = await axios.post(urlwrite, postData, {headers: header})
            const data = res.data

            console.log(data)

            await submitPostFile(data.id, isUpdatePost)

            return data.id
        }

    }

    // 파일 작성
    async function submitPostFile(boardId, isUpdatePost){
        const urlfilewriteapi = `${urlfilewrite}/${boardId}`

        const header = {
            "Authentication": token,
            "Content-Type": "multipart/form-data"
        }

        if(isUpdatePost){

            // beforeFilenameList - String 포함하여 전송
            // formdata로 보내기 위해 File 객체의 상위 클래스인 Blob으로 형변환 
            const formData = new FormData()

            file.forEach(f => formData.append("file", f))
            beforeFilenameList.forEach(dfilename => formData.append("beforeFilenameList", new Blob([dfilename], {type: "application/json"})) )
            
            // console.log(beforeFilenameList)
            


            const res = await axios.patch(urlfilewriteapi, formData, {headers: header})
            // const data = res.data

            // console.log(data)
        }
        else{
            const formData = new FormData()
            
            file.forEach(f => formData.append("file", f))
            


            const res = await axios.post(urlfilewriteapi, formData, {headers: header})
            // const data = res.data

            // console.log(data)

        }   
    }


    return (
        <div className="toolbarContainer">
            <label className="labelImage">
                파일
                <input type = "file" accept = "image/*" multiple onChange = {handlerImage} className="inputImage"></input>
            </label>

            <button onClick = {handleSubmitPost} className="postButton">
                저장
            </button>
        </div>
    )
}