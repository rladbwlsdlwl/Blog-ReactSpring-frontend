import "../../css/common.css"
import "../../css/FileList.css"
import { textToBlob } from "../../utils/commonUtils"

// 파일 프리뷰 컨테이너
export default function FileList({file, previewFile, beforeFilenameList, setFile, setPreviewFile, setBeforeFilenameList, disabled = false}){
    function handleDeleteFile(index) {
        setPreviewFile(previewFile.filter((_, idx) => idx != index))
        
        // 새로운 파일 삭제
        if(previewFile[index].currentFilename == "")
            setFile(file.filter(file => file.name != previewFile[index].originalFilename))
        else // 기존 파일 삭제 리스트 추가
            setBeforeFilenameList([...beforeFilenameList, previewFile[index].currentFilename])
    }


    // 삭제 버튼 가리기 - ReadOnly
    const buttonViewer = "fileListDeleteButton" + (disabled && " displayNone")
    return (
        <div className="fileListContainer">
            {
                previewFile.map((prevFile, index) => <div className="fileListPreviewImgContainer"> 
                    <img src = {prevFile.file} className = "fileListPreviewImg" key = {`preview file - ${index}`} alt = "이미지 오류"/>
                    <div className = "fileListPreviewFilename" key = {`preview file name - ${index}`}><span>{prevFile.originalFilename}</span> <button className = {buttonViewer} onClick = {() => handleDeleteFile(index)}> X </button> </div>
                </div>)
            }
        
        </div>
    )
}
