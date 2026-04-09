import { deleteCenter } from "../../api/evacuation";

const DeleteButton = ({ centerId, onDelete }) => {
    const handleDelete = async () => {
        await deleteCenter(centerId);
        onDelete();
    };

    return (
        <button onClick={handleDelete} className="delete-button">
            Delete
        </button>
    )
}

export default DeleteButton;