import { useContext, useEffect, useRef, useState } from "react"
import { AuthContext } from "../context/AuthProvider"
import { urlpath } from "../utils/apiUtils"
import Error from "./Error"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import axios from "axios"

import "../css/UserBoardCreateUpdate.css"

export default function UserBoardCreateUpdate(){
    const {username} = useParams()
    const [URLSearchParams, SetURLSearchParams] = useSearchParams()
    const [type, id] = [URLSearchParams.get("type"), URLSearchParams.get("id")]
    
    const urlwrite = urlpath + `/${username}`
    const urlupdate = urlpath + `/${username}/${id}`
    const urlfilewrite = urlpath + `/${username}/file`
    const urlfile = urlpath + `/${username}/file/${id}`

    // 접속 유저 이름찾기
    // 토큰 불러오기
    const {gettingToken, settingToken, gettingUsername, gettingUserId, getUserInfo} = useContext(AuthContext)
    const [activeUsername, token, author] = [gettingUsername(), gettingToken(), gettingUserId()]


    // 인풋 데이터
    const [board, setBoard] = useState({})
    const [file, setFile] = useState([])
    const [previewFile, setPreviewFile] = useState([])
    const [duplicateFilename, setDuplicateFilename] = useState([])


    // 에러 페이지
    const [error, setError] = useState(null)


    useEffect(() => {
        console.log(type, id)
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


            setFile(data.map(f => new File(Array.of(f), f.originalFilename))) // 파일 등록
            setDuplicateFilename(data.map(f => f.currentFilename)) // 기존 파일이름 등록 - PK, 중복된 파일은 등록하지 않음

            // 바이너리 데이터 to Base64
            setPreviewFile(data.map(f => {
                return "data:image/png;base64," + f.file
            }))
        }).catch(err => {

            console.log(err)

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
                duplicateFilename = {duplicateFilename}

                isUpdatePost = {type == "update"}
                urlwrite = {urlwrite}
                urlupdate = {urlupdate}
                urlfilewrite = {urlfilewrite}
                token = {token}  
                username = {username}
                author = {author}

                getUserInfo = {getUserInfo}
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
                previewFile = {previewFile}
            />
        </div>
    )
}


// 게시판 전송 및 파일 조작(File to Base64, Binary data) 컨테이너
const Toolbar = ({board, file, setFile, previewFile, setPreviewFile, duplicateFilename, urlwrite, urlupdate, urlfilewrite, isUpdatePost, token, username, author, getUserInfo}) => {

    const navigate = useNavigate()

    // setting - 파일 이미지 (File)
    function handlerImage(e){
        const files = Array.from(e.target.files)
        console.log(files)
        

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
                console.log(imglink)
                setPreviewFile((prev) => [...prev, imglink])
            }


            reader.readAsDataURL(f)
        })

    }

    // 게시글 작성 핸들러
    async function handleSubmitPost(){
        const header = {
            "Authentication": token
        }

        const postData = {
            ...board, 
            author: author
        }
        
        try{

            if(isUpdatePost){
                // patch
    
                const res = await axios.patch(urlupdate, postData, {headers: header})
                const data = res.data
                
                console.log(data)

                window.alert("작성 완료")


                await submitPostFile(data.id, isUpdatePost)
                
                navigate(`/${username}/${data.id}`)

            }else{
                // post
                
                const res = await axios.post(urlwrite, postData, {headers: header})
                const data = res.data

                console.log(data)

                window.alert("작성 완료")


                await submitPostFile(data.id, isUpdatePost)

                navigate(`/${username}/${data.id}`)
            }

        }catch(err){
            console.log(err)
            

            if(err.response.data.status == 401 || err.response.status == 401){ // 토큰 만료 - JWT EXPIRED
                getUserInfo()
            } 
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

            // formdata로 보내기 위해 File 객체의 상위 클래스인 Blob으로 형변환 
            const formData = new FormData()

            file.forEach(f => formData.append("file", f))
            duplicateFilename.forEach(dfilename => formData.append("duplicateFilename", new Blob([dfilename], {type: "application/json"})) )
            
            console.log(duplicateFilename)
            


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

// 파일 프리뷰 컨테이너
const FileList = ({file, previewFile, setFile, setPreviewFile}) =>{

    useEffect(() => {
        console.log(previewFile)
    }, [previewFile])


    function handleDeleteFile(index){
        setFile(file.filter((data, idx) => idx != index))
        setPreviewFile(previewFile.filter((data, idx) => idx != index))
    }


    return (
        <div className="fileListContainer">
            {
                previewFile.map((prevFile, index) => <div className="previewImgContainer"> 
                    <img src = {prevFile} className = "previewImg" key = {`preview file - ${index}`}/>
                    <div className = "previewFilename" key = {`preview file name - ${index}`}><span>{file[index].name}</span> <button className = "deleteButton" onClick = {() => handleDeleteFile(index)}> X </button> </div>
                </div>)
            }
        
        </div>
    )
}

// 게시판 컨테이너
const BoardList = ({board, setBoard}) =>{

    function handleTextarea(e){
        console.log(e)
        const {name, value} = e.target

        setBoard({
            ...board,
            [name]: value
        })
    }

    return (
        <div>
            <textarea name = "title" value = {board.title} onChange = { handleTextarea } maxLength={15} className="title">
                
            </textarea>

            <hr />

            <textarea name = "contents" value = {board.contents} onChange = { handleTextarea } maxLength={999998} className="contents">
                
            </textarea>
        </div>
    )
}