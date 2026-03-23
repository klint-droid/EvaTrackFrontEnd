import { useState, useEffect } from "react";
import API from "../api";
import DashboardLayout from "../layout/DashboardLayout";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({});
    const [editingUser, setEditingUser] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(null);
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        password: "",
        role: "user"
    })

    const currentUser = JSON.parse(localStorage.getItem("user"));

    const fetchUsers = async(page = 1) => {
        try{
            const res = await API.get(`/api/users?page=${page}`);
            setUsers(res.data.data);
            setPagination(res.data);
        } catch (err){
            console.error(err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const createUser = async () => {
        try{
            await API.post("/api/users", newUser);
            alert("User created successfully!");
            setShowCreateModal(false);
            setNewUser({
                name: "",
                email: "",
                password: "",
                role: "user"
            });
            fetchUsers(pagination.current_page || 1);
        } catch (err){
            alert(err.response?.data?.message || "Create Failed");
        }
    }
    //DELETE USER
    const deleteUser = async(id) => {
        if(!confirm("Are you sure you want to delete this user?")) return;

        try{
            await API.delete(`/api/users/${id}`);
            fetchUsers(pagination.current_page);
        } catch (err){
            alert(err.response?.data?.message || "Delete Failed");
        }
    }

    const updateUser = async() => {
        try{
            await API.put(`/api/users/${editingUser.id}`, editingUser);
            alert("User updated successfully!");
            setEditingUser(null);
            fetchUsers(pagination.current_page);
        } catch (err){
            console.error(err);
        }
    }

    return(
        <DashboardLayout>
            <div className="p-6">
               <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">User Management</h1>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        Add User
                    </button>
                </div>

                <div className="overflow-x-auto bg-white shadow rounded-lg">
                    
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="px-4 py-2">ID</th>
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2">Email</th>
                                <th className="px-4 py-2">Role</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-t">
                                    <td className="px-4 py-2">{user.id}</td>
                                    <td className="px-4 py-2">{user.name}</td>
                                    <td className="px-4 py-2">{user.email}</td>
                                    <td className="px-4 py-2">{user.role}</td>
                                    
                                    <td className="px-4 py-2 flex gap-2">
                                        <button onClick={() => setEditingUser(user)}
                                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                            >
                                            Edit
                                        </button>

                                        {(currentUser.role === "super_admin" ||
                                            (currentUser.role === "admin" && user.role === "user")
                                        ) && (
                                            <button
                                                onClick={() => deleteUser(user.id)}
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                                >
                                                Delete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center mt-4">
                    {pagination.prev_page_url && (
                        <button 
                            onClick={() => fetchUsers(pagination.current_page - 1)}
                            className="px-4 py-2 bg-gray-200 rounded"
                        >
                            Prev
                        </button>
                    )}
                </div>

                {editingUser && (
                    <div className="fixed inset-0 bg-black bg-opacity=40 flex justify-center items-center">
                        <div className="bg-white p-6 rounded shadow w-96">
                            <h2 className="text-lg font-bold mb-4">Edit User</h2>

                            <input type="text" value={editingUser.name}
                                onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                                className="w-full border p-2 rounded mb-2"
                                placeholder="Name"
                            />

                            <input type="email" value={editingUser.email}
                                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                className="w-full border p-2 rounded mb-2"
                                placeholder="Email"
                            />

                        {currentUser.role === "super_admin" && (
                            <select
                                value={editingUser.role}
                                onChange={(e) =>
                                setEditingUser({ ...editingUser, role: e.target.value })
                                }
                                className="w-full border p-2 mb-3 rounded"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="super_admin">Super Admin</option>
                            </select>
                            )}

                            <div className="flex justify-end gap-2">
                                <button onClick={() => setEditingUser(null)}
                                    className="px-4 py-2 bg-gray-200 rounded"
                                >
                                    Cancel
                                </button>

                                <button onClick={updateUser}
                                    className="px-4 py-2 bg-blue-500 text-white rounded"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
                        <div className="bg-white p-6 rounded shadow w-96">
                        <h2 className="text-lg font-bold mb-4 text-blue-600">Create User</h2>

                        <input
                            type="text"
                            placeholder="Name"
                            value={newUser.name}
                            onChange={(e) =>
                            setNewUser({ ...newUser, name: e.target.value })
                            }
                            className="w-full border p-2 mb-2 rounded"
                        />

                        <input
                            type="email"
                            placeholder="Email"
                            value={newUser.email}
                            onChange={(e) =>
                            setNewUser({ ...newUser, email: e.target.value })
                            }
                            className="w-full border p-2 mb-2 rounded"
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={newUser.password}
                            onChange={(e) =>
                            setNewUser({ ...newUser, password: e.target.value })
                            }
                            className="w-full border p-2 mb-3 rounded"
                        />

                        {/* ROLE SELECT (only super_admin can choose) */}
                        {currentUser.role === "super_admin" && (
                            <select
                            value={newUser.role}
                            onChange={(e) =>
                                setNewUser({ ...newUser, role: e.target.value })
                            }
                            className="w-full border p-2 mb-3 rounded"
                            >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            </select>
                        )}

                        <div className="flex justify-end gap-2">
                            <button
                            onClick={() => setShowCreateModal(false)}
                            className="px-4 py-2 bg-gray-300 rounded"
                            >
                            Cancel
                            </button>

                            <button
                            onClick={createUser}
                            className="px-4 py-2 bg-green-500 text-white rounded"
                            >
                            Create
                            </button>
                        </div>
                        </div>
                    </div>
                    )}
            </div>
        </DashboardLayout>
    );
}

export default UserManagement;