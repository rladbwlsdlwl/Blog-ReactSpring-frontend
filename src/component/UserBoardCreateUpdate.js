import { useContext, useEffect, useRef, useState } from "react"
import { AuthContext } from "../context/AuthProvider"
import { urlpath } from "../utils/apiUtils"
import Error from "./Error"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import axios from "axios"
import BoardList from "./common/BoardList"
import FileList from "./common/FileList"

import "../css/UserBoardCreateUpdate.css"
import { getErrorCode, getErrorMsg, getFileUrl } from "../utils/commonUtils"

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
    const beforeBoard = useRef({}) // 롤백 데이터 저장
    const [board, setBoard] = useState({})
    const [file, setFile] = useState([]) // 새로운 파일만 등록 <File>
    const [previewFile, setPreviewFile] = useState([]) // 모든 파일 미리보기 url
    const [beforeFilenameList, setBeforeFilenameList] = useState([]) // 기존 파일만 등록 <Json Obj>


    // 에러 페이지
    const [error, setError] = useState(null)


    useEffect(() => {
        
        if(type == "write"){
            return 
        }else if(type == "update"){
            
            Promise.all([
                getBoardList(),
                getFileList()
            ]).catch(err => {
                const code = getErrorCode(err)
                const msg = getErrorMsg(err)

                console.log(msg)
                setError(true)
            }) 

        }else{
            setError(true)
        }


        return () => {
            // Blob URL 메모리 해제
            previewFile.map(prevFile => {
                // URL이 아닌 새로운 파일 미리보기는 메모리 해제
                if(prevFile.currentFilename == "") 
                    URL.revokeObjectURL(prevFile.file)
            })
        }
    }, [])


    // 게시판 불러오기
    async function getBoardList(){
        const res = await axios.get(urlupdate)

        const data = res.data

        beforeBoard.current = data
        setBoard(data)
    }

     // 파일 불러오기
     async function getFileList(){
        const res = await axios.get(urlfile)

        const data = res.data

   
        setPreviewFile(data) // currentFilename =  "" 이면 신규 파일, 그렇지 않으면 기존 파일
        
        setBeforeFilenameList(data.map(f => f.currentFilename)) // 기존 파일이름 등록
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
                beforeBoard = {beforeBoard}
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
                file = {file} // 새로운 파일 
                previewFile = {previewFile} // 모든 파일 
                beforeFilenameList = {beforeFilenameList} // 기존 파일
                setFile = {setFile}
                setPreviewFile = {setPreviewFile}
                setBeforeFilenameList = {setBeforeFilenameList}
            />
            
            <BoardList 
                board = {board}
                setBoard = {setBoard}
            />
        </div>
    )
}


// 게시판 전송 및 파일 조작(File to Base64, Binary data) 컨테이너
const Toolbar = ({board, file, setFile, previewFile, setPreviewFile, beforeFilenameList, urlwrite, urlupdate, urlfilewrite, isUpdatePost, token, username, author, settingToken, getErrorCode, getErrorMsg, beforeBoard}) => {

    const navigate = useNavigate()

    // setting - 파일 이미지 (File)
    function handlerImage(e){
        const files = Array.from(e.target.files)
        // console.log(files)
        

        // 파일 검증 로직
        // jpeg, png, jpg...
        const isValidateFilesType = (files) =>{
            for(let f of files){
                if(!["image/png", "image/jpg", "image/jpeg", "image/heif"].includes(f.type)){
                    return false
                }
            }

            // console.log("type passed!")
            return true
        }

        // 단독 파일은 5MB 이하, 파일 총 50MB를 넘지 않아야 함
        const isValidateFileSize = (files) =>{
            let pSum = 0
            for(let f of files){
                pSum += f.size

                if(f.size > 5000_000){
                    return false
                }
            }

            if(pSum > 50_000_000){
                return false
            }

            
            // console.log("size passed!", pSum)
            return true
        }
        

        if(!isValidateFilesType(files) || !isValidateFileSize(files)){
            window.alert("파일의 타입이 맞지 않거나 용량 초과입니다")

            return 
        }


        // File to Base64
        // 파일을 이진데이터 텍스트로 변환 - FileReader의 readAsDataURL
        // updatePreviewImage(files)
        

        // Blob(File) 타입으로 변환 - URL.createObjectURL
        setPreviewFile([...previewFile, ...files.map(file => {
            return {
                file: getFileUrl(file),
                originalFilename: file.name,
                currentFilename: ""
            }
        })])
        setFile([...file, ...files])
    }


    // setting - 파일 미리보기 이미지 
    // function updatePreviewImage(files){
        
    //     files.forEach(f => {
    //         const reader = new FileReader()
    //         reader.onload = (e) => {
    //             const imglink = e.target.result
    //             // console.log(imglink)
    //             setPreviewFile((prev) => [...prev, imglink])
    //         }


    //         reader.readAsDataURL(f)
    //     })

    // }

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
            }else if(code == 500){ // 네트워크 에러 - 파일 용량 초과, 연결 끊어짐, 원자성으로 인한 롤백 수행 (파일 - 게시판)
                
                if(beforeBoard.current.id){ // 롤백 데이터가 존재하는 경우 - 되돌리기

                    const header = {
                        "Authentication": token
                    }
            
                    const postData = {
                        ...beforeBoard.current, 
                        author: author
                    }

                    axios.patch(urlupdate, postData, {headers: header}).then(res => {
                        const data = res.data
                        
                        console.log("롤백 성공! - ", data)
                    }).catch(err => {
                        
                        console.log("롤백 실패! - ", err)
                    })

                }else if(beforeBoard.current.boardId){ // 롤백 데이터가 없는 경우 - 삭제
                    
                    const id = beforeBoard.current.boardId
                    const urldelete = urlpath + `/${username}/${id}`
                    
                    const header = {
                        "Authentication": token
                    }
            
                    axios.delete(urldelete, {headers: header}).then(res => {
                        const data = res
                        
                        console.log("롤백 성공! - ", data)
                    }).catch(err => {
                        
                        console.log("롤백 실패! - ", err)
                    })

                }else{
                    console.log("로직에 문제가 있는 상황입니다... 트랜젝션이 이루어지지 않음")
                }
            
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
            ...board
        }

        if(isUpdatePost){
            // patch

            const res = await axios.patch(urlupdate, postData, {headers: header})
            const data = res.data
            
            // console.log(data)

            await submitPostFile(data.id, isUpdatePost)

            return data.id
        }else{
            // post
            
            const res = await axios.post(urlwrite, postData, {headers: header})
            const data = res.data

            beforeBoard.current = {boardId: data.id}
            // console.log(data)

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
            <label className="toolbarLabel">
                파일
                <input type = "file" accept = "image/*" multiple onChange = {handlerImage} className="toolbarLabelInput"></input>
            </label>

            <button onClick = {handleSubmitPost} className="toolbarPostBtn">
                저장
            </button>
        </div>
    )
}
