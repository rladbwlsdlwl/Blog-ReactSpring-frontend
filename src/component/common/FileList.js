import "../../css/common.css"
import { textToBlob } from "../../utils/commonUtils"

// 파일 프리뷰 컨테이너
export default function FileList({file, previewFile, setFile, setPreviewFile, disabled = false}){
    function handleDeleteFile(index){
        setFile(file.filter((data, idx) => idx != index))
        setPreviewFile(previewFile.filter((data, idx) => {
            if(idx == index) URL.revokeObjectURL(data.file) // 메모리 해제

            return idx != index
        }))
    }

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
