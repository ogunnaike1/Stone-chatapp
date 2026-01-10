import React, { useState } from 'react'
import api from '../../api/axios';
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";


const SignUp = () => {

    const navigate = useNavigate();


    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
      });
      const [loading, setLoading] = useState<boolean>(false);
    
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
        const { name, value } = e.target;

        setFormData({
          ...formData,
          [name]: value,
        });
      }
    
   const handleSubmit = async()=>{

    setLoading(true)
     
    try {
        const res = await api.post(
          "/user/signup",
          formData
        );
  
        console.log(res.data);
        toast.success("Signup successful");
        setTimeout(() => {
            navigate("/auth/login")
        }, 1500);
      } catch (error:any) {
        console.error(error.response?.data);
        toast.error(error.response?.data?.message || "Signup failed");
   
      } finally {
        setLoading(false);
      }
   }   

   
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
  <div className="w-full max-w-md">
    <div className="shadow-md rounded-lg p-6 bg-white">
      <h2 className="text-2xl font-bold text-center mb-6">Sign up</h2>

      <input
        type="text"
        name="username"
        placeholder="Username"
        className="w-full border px-3 py-2 rounded mb-4"
        onChange={handleChange}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        className="w-full border px-3 py-2 rounded mb-4"
        onChange={handleChange}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        className="w-full border px-3 py-2 rounded mb-6"
        onChange={handleChange}
      />

      <button disabled={loading} onClick={handleSubmit} className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">
      {loading ? "Signing up..." : "Sign up"}
      </button>

      <p className="mt-4 text-center text-gray-600">
        Already have an account?{" "}
        <Link to='/auth/login' className="text-blue-500 hover:underline">
          Login
        </Link>
      </p>
    </div>
  </div>
</div>

  )
}

export default SignUp