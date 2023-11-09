import React, {useState} from "react";
import { useForm } from "react-hook-form";
import useSWR from 'swr'
import {useSWRConfig} from 'swr'
import Button from "./common/Button";
import Spinner from "./common/Spinner";
import {EditIcon, TrashIcon, EyeIcon} from "./icons";
import * as utils from '../utils/utils'

export default function Courses() {

  const API_URL = '/api/courses';
  const [stage, setStage] = useState('LIST');
  const [viewOnly, setViewOnly] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { data, error, isLoading, isValidating } = useSWR(API_URL, (url) => fetch(url).then(res => res.json()))
  const { mutate } = useSWRConfig()

  if (error) console.log(error)

  const removeCourse = async (courseId) => {
    if (window.confirm("Seguro desea eliminar este tipo de escolaridad?")) {
      try {
        await mutate(API_URL, utils.deleteRequest(`${API_URL}/${courseId}`), {optimisticData: true})
      } catch (e) {
        console.log(e);
      }
    }
  }

  const onSubmit = async (data) => {
    try {
      setIsLoadingSubmit(true)
      if (selectedCourse) {
        await mutate(API_URL, utils.patchRequest(`${API_URL}/${selectedCourse._id}`, data), {optimisticData: true})
      }else{
        await mutate(API_URL, utils.postRequest(API_URL, data), {optimisticData: true})
      }
      setIsLoadingSubmit(false)
      setSelectedCourse(null)
      setStage('LIST')
    } catch (e) {
      console.log(e);
    }
  }

  const onEdit = (courseId) => {
    reset()
    const course = data.find(course => course._id === courseId) || null;
    setSelectedCourse(course);
    setStage('CREATE')
  }

  const onView = (courseId) => {
    const course = data.find(course => course._id === courseId) || null;
    setSelectedCourse(course);
    setViewOnly(true)
    setStage('CREATE')
  }

  const onCreate = () => {
    setSelectedCourse(null);
    setStage('CREATE')
  }
  
  const onCancel = () => {
    setSelectedCourse(null);
    setViewOnly(false)
    reset()
    setStage('LIST')
  }

  return (
    <div className="px-4 h-full overflow-auto mt-4">
      <div className="w-full flex sticky top-0 z-10 bg-white rounded pb-4">
        <h1 className="inline-block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200">Cursos</h1>
        <Button variant="alternative" className="ml-auto" onClick={() => onCreate()}>Crear</Button>
      </div>
      {
        (isLoading || isValidating) && (
          <div>
            <Spinner />
          </div>
        )
      }
      {
        error && (
          <div className="text-red-500">
            {/* ERROR... */}
          </div>
        )
      }
      {
        stage === 'LIST' && data && !isValidating && (
          <div className="mt-4 -mb-3">
            <div className="not-prose relative bg-slate-50 rounded-xl overflow-hidden dark:bg-slate-800/25">
              <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" style={{"backgroundPosition": "10px 10px"}}></div>
              <div className="relative rounded-xl overflow-auto">
                <div className="shadow-sm overflow-hidden my-8">
                  <table className="border-collapse table-fixed w-full text-sm">
                    <thead>
                      <tr>
                        <th className="border-b dark:border-slate-600 font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">Nombre</th>
                        <th className="border-b dark:border-slate-600 font-medium p-4 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">Cuota</th>
                        <th className="border-b dark:border-slate-600 font-medium p-4 pr-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800">
                      {
                        data.length ? 
                          data.map(course => (
                            <tr key={course._id}>
                              <td className="border-b border-slate-100 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400">{course.name}</td>
                              <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">{course.price}</td>
                              <td className="border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 w-10">
                                <div className="flex gap-2">
                                  <button className="flex items-center justify-center w-8 h-8" title="Ver detalle" onClick={() => onView(course._id)}><EyeIcon/></button>
                                  <button className="flex items-center justify-center w-8 h-8" title="Editar" onClick={() => onEdit(course._id)}><EditIcon/></button>
                                  <button className="flex items-center justify-center w-8 h-8" title="Eliminar" onClick={() => removeCourse(course._id)}><TrashIcon/></button>
                                </div>
                              </td>
                            </tr>
                          ))
                          :
                          (
                            <tr>
                              <td colSpan={4} className="border-b border-slate-100 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400">No data</td>
                            </tr>
                          )
                      }
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="absolute inset-0 pointer-events-none border border-black/5 rounded-xl dark:border-white/5"></div>
            </div>
          </div>
        )
      }

      {
        stage === 'CREATE' && (
          <div className="mt-4 -mb-3">
            <div className="not-prose relative bg-slate-50 rounded-xl overflow-hidden dark:bg-slate-800/25">
              <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" style={{"backgroundPosition": "10px 10px"}}></div>
              <div className="relative rounded-xl overflow-auto">
                <div className="shadow-sm overflow-hidden my-8">
                  <form onSubmit={handleSubmit(onSubmit)} className='w-full flex flex-col'>
                    <table className="border-collapse table-fixed w-full text-sm bg-white">
                      <tbody>
                        {/* ================ */}
                        <tr>
                          <td>
                            <div className="p-4 gap-2 flex items-center">
                              <label className="text-slate-500 dark:text-slate-400 w-20 font-bold">Nombre:</label>
                              {
                                viewOnly ? 
                                <label className="text-slate-500 dark:text-slate-400 w-20">{selectedCourse?.name}</label>
                                :
                                <input type="text" defaultValue={selectedCourse?.name || ''} {...register("name", { required: true })} className="rounded border border-slate-200 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400" />
                              }
                              {errors.name && <span className='px-2 text-red-500'>* Obligatorio</span>}
                            </div>
                          </td>
                        </tr>
                        {/* ================ */}
                        <tr>
                          <td>
                            <div className="p-4 gap-2 flex items-center">
                              <label className="text-slate-500 dark:text-slate-400 w-20 font-bold">Cuota:</label>
                              {
                                viewOnly ? 
                                <label className="text-slate-500 dark:text-slate-400 w-20">{selectedCourse?.price}</label>
                                :
                                <input type="text" defaultValue={selectedCourse?.price || ''} {...register("price", { required: true })} className="rounded border border-slate-200 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400" />
                              }
                              {errors.price && <span className='px-2 text-red-500'>* Obligatorio</span>}
                            </div>
                          </td>
                        </tr>
                        {/* ================ */}
                        <tr>
                          <td>
                            <div className="p-4 gap-2 flex items-center">
                              {
                                viewOnly ? 
                                  <div>
                                    <Button variant="alternativeSecondary" onClick={() => onCancel()}>Volver</Button>
                                </div>
                                :
                                  <div className="gap-2 flex">
                                    <Button variant="destructive" onClick={() => onCancel()}>Cancelar</Button>
                                    <Button type="submit" disabled={isLoadingSubmit}>{isLoadingSubmit ? 'Guardando...' : 'Guardar'}</Button>
                                  </div>
                              }
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </form>
                </div>
              </div>
              <div className="absolute inset-0 pointer-events-none border border-black/5 rounded-xl dark:border-white/5"></div>
            </div>
          </div>
        )
      }
    </div>
  );
}
