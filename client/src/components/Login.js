import { useNavigate } from "react-router-dom";
import React, {useState} from "react";
import useSWR from 'swr'
import Button from "./common/Button";
import md5 from 'md5'
import { useForm } from "react-hook-form";

export default function Login() {
  const API_URL = '/api/users';
  const [errorLogin, setErrorLogin] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { data, error, isLoading } = useSWR(API_URL, (url) => fetch(url).then(res => res.json()))
  const navigate = useNavigate();

  const setCredentials = (userLogin) => {
    sessionStorage.username = userLogin.username;
    sessionStorage.name = userLogin.name;
    sessionStorage.lastName = userLogin.lastName;
    navigate("/home");
  }

  const onSubmit = async (formData) => {  
    const userLogin = data.find(user => user.username === formData.username);

    if (formData.username === userLogin?.username && md5(formData.password) === userLogin.password) {
      await setCredentials(userLogin)
    } else {
      setErrorLogin('Usuario o Clave erroneos')
    }
  }

  return (
    <div className="flex flex-col w-screen h-screen text-white bg-gray-900">
      <div className="flex h-[calc(100vh-4rem)]">
        <main className="flex-1">
          <div className="h-full overflow-auto mt-4">
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center justify-center p-4 rounded w-[400px] ">
                <h1 className="rounded p-4 text-white inline-block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200">LOGIN</h1>

                <form onSubmit={handleSubmit(onSubmit)} className='w-full flex flex-col'>
                  <input type="text" {...register("username", { required: true })} className="mt-2 rounded border border-slate-200 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400" />
                  {errors.username && <span className='px-2 text-red-500'>* Obligatorio</span>}
                  <input type="password" {...register("password", { required: true })} className="mt-2 rounded border border-slate-200 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400" />
                  {errors.password && <span className='px-2 text-red-500'>* Obligatorio</span>}
                  <Button className="mt-2">Login</Button>
                  {errorLogin && <span className='p-2 text-red-500'>{errorLogin}</span>}
                </form>

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
