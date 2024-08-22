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
            <textarea name = "boardListTitle" value = {board.title} onChange = { handleTextarea } maxLength={15} className="title" disabled = {disabled}>
                
            </textarea>

            <hr />

            <textarea name = "boardListContents" value = {board.contents} onChange = { handleTextarea } maxLength={999998} className="contents" disabled = {disabled}>
                
            </textarea>
        </div>
    )
}