import "../../css/common.css"

// 게시판 컨테이너
export default function BoardList({board, setBoard, disabled = false}){

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
            <textarea name = "title" value = {board.title} onChange = { handleTextarea } maxLength={15} className="boardListTitle" disabled = {disabled}>
                
            </textarea>

            <hr className = "boardListLine"/>

            <textarea name = "contents" value = {board.contents} onChange = { handleTextarea } maxLength={999998} className="boardListContents" disabled = {disabled}>
                
            </textarea>
        </div>
    )
}