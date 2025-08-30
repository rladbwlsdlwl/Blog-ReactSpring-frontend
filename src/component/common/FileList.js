import "../../css/common.css"
import "../../css/FileList.css"
import { textToBlob } from "../../utils/commonUtils"

// 파일 프리뷰 컨테이너
export default function FileList({file, previewFile, beforeFilenameList, setFile, setPreviewFile, setBeforeFilenameList, disabled = false}){
    function handleDeleteFile(index) {
        setPreviewFile(previewFile.filter((_, idx) => idx != index))
        
        // 새로운 파일
        setFile(file.filter(file => !(previewFile[index].currentFilename == "" && file.name == previewFile[index].originalFilename)))

        // 기존 파일
        setBeforeFilenameList(beforeFilenameList.filter(filename => filename != previewFile[index].currentFilename))
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
