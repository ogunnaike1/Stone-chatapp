import React, { useState } from 'react'
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import api from '../../api/axios';


const Login = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
      });
      const [loading, setLoading] = useState<boolean>(false);

      const handleChange =(e:React.ChangeEvent<HTMLInputElement>)=>{
        const {name, value} = e.target

        setFormData({
            ...formData,
            [name]:value
        })

      }

    const handleLogin = async()=>{
        setLoading(true)

        try {
            const res = await api.post("/user/login", formData)

            const { token, user } = res.data;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            console.log(res.data);
            toast.success("Login successful");
            
            setTimeout(() => {
                navigate("/chathome")
                
            }, 1500);
        } catch (error: any) {
            console.error(error.response?.data);
            toast.error(error.response?.data?.message || "Login failed")
            
        }finally {
            setLoading(false);
          }
    

    }
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
    <div className="bg-white p-6 rounded-lg w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4 text-center">Login</h2>
  
      <input
        type="email"
        name="email"
        placeholder="Email"
        className="w-full mb-4 border px-3 py-2 rounded"
        onChange={handleChange}
        />
  
        <input
        type="password"
        name="password"
        placeholder="Password"
        className="w-full mb-4 border px-3 py-2 rounded"
        onChange={handleChange}
        />
  
      <button onClick={handleLogin} disabled={loading} className="w-full py-2 rounded text-white bg-blue-600 hover:bg-blue-700">
      {loading ? "Logging in..." : "Login"}
      </button>

      <p className="mt-4 text-center text-gray-600">
        You do not have an account?{" "}
        <Link to='/' className="text-blue-500 hover:underline">
          Sign Up
        </Link>
      </p>

    </div>
  </div>
  
  )
}

export default Login