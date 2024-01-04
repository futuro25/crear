import React, {useState} from "react";
import { Controller, useForm } from "react-hook-form";
import useSWR from 'swr'
import {useSWRConfig} from 'swr'
import Button from "./common/Button";
import Spinner from "./common/Spinner";
import {EditIcon, TrashIcon, EyeIcon, CloseIcon} from "./icons";
import * as utils from '../utils/utils'
import { Dialog, DialogContent } from "./common/Dialog";
import { Input } from "./common/Input";
import Datepicker from "tailwind-datepicker-react"
import { ArrowLeftIcon, ArrowRightIcon } from "./icons";

const options = utils.getDatePickerOptions(ArrowLeftIcon, ArrowRightIcon)

export default function Students() {

  const API_URL = '/api/students';
  const API_URL_INSURANCES = '/api/insurances';
  const API_URL_COURSES = '/api/courses';
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('LIST');
  const [show, setShow] = useState(false)
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pictureLink, setPictureLink] = useState();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm();
  const { data, error, isLoading, isValidating } = useSWR(API_URL, (url) => fetch(url).then(res => res.json()))
  const {data: dataInsurances} = useSWR(API_URL_INSURANCES, (url) => fetch(url).then(res => res.json()))
  const {data: dataCourses} = useSWR(API_URL_COURSES, (url) => fetch(url).then(res => res.json()))
  const { mutate } = useSWRConfig()
  const dataFiltered = data && data?.length > 0 && data?.filter((d) => search ? d.name.toLowerCase().includes(search.toLowerCase()) || d.lastName.toLowerCase().includes(search.toLowerCase()) : d);

  if (error) console.log(error)

  const handleClose = (state) => {
		setShow(state)
	}
  
  const handleChange = (data) => {
		console.log(data)
	}

  const removeStudent = async (studentId) => {
    if (window.confirm("Seguro desea eliminar este estudiante?")) {
      try {
        await mutate(API_URL, utils.deleteRequest(`${API_URL}/${studentId}`), {optimisticData: true})
      } catch (e) {
        console.log(e);
      }
    }
  }

  const getInsuranceName = (insuranceId) => {
    return dataInsurances ? dataInsurances.find(insurance => insurance._id === insuranceId)?.name || "" : "";
  }

  const getCourseName = (courseId) => {
    return dataCourses.find(course => course._id === courseId)?.name || "";
  }

  const onSubmit = async (data) => {
    try {
      setIsLoadingSubmit(true)
      let body = data;
      if (data.file.length) {
        const resource = await utils.uploadResource(data);
        body = {
          ...data,
          cudUrl: resource.secure_url
        }
      }

      if (selectedStudent) {
        await mutate(API_URL, utils.patchRequest(`${API_URL}/${selectedStudent._id}`, body), {optimisticData: true})
      }else{
        await mutate(API_URL, utils.postRequest(API_URL, body), {optimisticData: true})
      }
      setIsLoadingSubmit(false)
      setStage('LIST')
    } catch (e) {
      console.log(e);
    }
  }

  const onEdit = (studentId) => {
    reset()
    const student = data.find(student => student._id === studentId) || null;
    setSelectedStudent(student);
    setStage('CREATE')
  }

  const onView = (studentId) => {
    const student = data.find(student => student._id === studentId) || null;
    setSelectedStudent(student);
    setViewOnly(true)
    setStage('CREATE')
  }

  const onCreate = () => {
    setSelectedStudent(null);
    setStage('CREATE')
  }
  
  const onCancel = () => {
    setSelectedStudent(null);
    setViewOnly(false)
    reset()
    setStage('LIST')
  }

  const onCloseModal = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsModalOpen(false)
  }

  const onOpenModal = (link) => {
    setPictureLink(link)
    setIsModalOpen(true)
  }

  const documentNumberValidation = (email) => {
    return !data.find(user => user.email === email);
  }

  return (
    <div className="px-4 h-full overflow-auto mt-4">
      <div className="w-full flex sticky top-0 z-10 bg-white rounded pb-4">
        <h1 className="inline-block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200">Estudiantes</h1>
        <Button variant="alternative" className="ml-auto" onClick={() => onCreate()}>Crear</Button>
      </div>
      {
        stage === 'LIST' && (
          <div className="w-full flex bg-white rounded pb-4">
            <Input rightElement={<div className="cursor-pointer" onClick={() => setSearch('')}>{search && <CloseIcon />}</div>} type="text" value={search} name="search" id="search" placeholder="Buscador..." onChange={(e) => setSearch(e.target.value)} />
          </div>
        )
      }

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
                        <th className="border-b dark:border-slate-600 font-medium p-4 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">Apellido</th>
                        <th className="border-b dark:border-slate-600 font-medium p-4 pr-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">Plan</th>
                        <th className="border-b dark:border-slate-600 font-medium p-4 pr-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800">
                      {
                        dataFiltered.length ?
                        dataFiltered.map((student) => (
                            <tr key={student._id}>
                              <td className="text-left border-b border-slate-100 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400">{student.name}</td>
                              <td className="text-left border-b border-slate-100 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">{student.lastName}</td>
                              <td className="text-left border-b border-slate-100 dark:border-slate-700 p-4 pr-8 text-slate-500 dark:text-slate-400">{getInsuranceName(student.healthInsurance)}</td>
                              <td className="text-left border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 w-10">
                                <div className="flex gap-2">
                                  <button className="flex items-center justify-center w-8 h-8" title="Ver detalle" onClick={() => onView(student._id)}><EyeIcon/></button>
                                  <button className="flex items-center justify-center w-8 h-8" title="Editar" onClick={() => onEdit(student._id)}><EditIcon/></button>
                                  <button className="flex items-center justify-center w-8 h-8" title="Eliminar" onClick={() => removeStudent(student._id)}><TrashIcon/></button>
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
                            {/* <div className="p-4 gap-4 flex items-center">
                              <img src={selectedStudent?.cudUrl} alt={selectedStudent?._id} width={200} />
                            </div> */}
                            <div className="p-4 gap-4 flex items-center">
                              <label className="text-slate-500 dark:text-slate-400 w-20 font-bold">Nombre:</label>
                              {
                                viewOnly ? 
                                <label className="text-slate-500 dark:text-slate-400 w-20">{selectedStudent?.name}</label>
                                :
                                <input type="text" defaultValue={selectedStudent?.name || ''} {...register("name", { required: true })} className="rounded border border-slate-200 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400" />
                              }
                              {errors.name && <span className='px-2 text-red-500'>* Obligatorio</span>}
                            </div>
                          </td>
                        </tr>
                        {/* ================ */}
                        <tr>
                          <td>
                            <div className="p-4 gap-4 flex items-center">
                              <label className="text-slate-500 dark:text-slate-400 w-20 font-bold">Apellido:</label>
                              {
                                viewOnly ? 
                                <label className="text-slate-500 dark:text-slate-400 w-20">{selectedStudent?.lastName}</label>
                                :
                                <input type="text" defaultValue={selectedStudent?.lastName || ''} {...register("lastName", { required: true })} className="rounded border border-slate-200 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400" />
                              }
                              {errors.lastName && <span className='px-2 text-red-500'>* Obligatorio</span>}
                            </div>
                          </td>
                        </tr>
                        {/* ================ */}
                        <tr>
                          <td>
                            <div className="p-4 gap-4 flex items-center">
                              <label className="text-slate-500 dark:text-slate-400 w-20 font-bold">Plan:</label>
                              {
                                viewOnly ? 
                                <label className="text-slate-500 dark:text-slate-400 w-20">{getInsuranceName(selectedStudent?.healthInsurance)}</label>
                                :
                                <select defaultValue={selectedStudent?.healthInsurance || ''} {...register("healthInsurance", { required: true })} className="rounded border border-slate-200 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">
                                  <option value="" disabled>Select</option>
                                  {
                                    dataInsurances && dataInsurances.map(insurance => 
                                      <option key={insurance._id} value={insurance._id}>{insurance.name}</option>
                                    )
                                  }
                                </select>
                              }
                              {errors.healthInsurance && <span className='px-2 text-red-500'>* Obligatorio</span>}
                            </div>
                          </td>
                        </tr>
                        {/* ================ */}
                        <tr>
                          <td>
                            <div className="p-4 gap-4 flex items-center">
                              <label className="text-slate-500 dark:text-slate-400 w-20 font-bold">DNI:</label>
                              {
                                viewOnly ? 
                                <label className="text-slate-500 dark:text-slate-400 w-20">{selectedStudent?.documentNumber}</label>
                                :
                                <input
                                  type="text"
                                  id="documentNumber"
                                  name="documentNumber"
                                  defaultValue={selectedStudent?.documentNumber || ''}
                                  {...register("documentNumber", { required: true, validate: documentNumberValidation })}
                                  className="rounded border border-slate-200 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400"  
                                />
                              }
                              {errors.documentNumber?.type === 'required' && <span className='px-2 text-red-500'>* Obligatorio</span>}
                              {errors.documentNumber?.type === 'validate' && <span className='px-2 text-red-500'>* DNI existente</span>}
                            </div>
                          </td>
                        </tr>
                        {/* ================ */}
                        <tr>
                          <td>
                            <div className="p-4 gap-4 flex items-center">
                              <label className="text-slate-500 dark:text-slate-400 w-20 font-bold">Email:</label>
                              {
                                viewOnly ? 
                                <label className="text-slate-500 dark:text-slate-400 w-20">{selectedStudent?.email}</label>
                                :
                                <input type="text" defaultValue={selectedStudent?.email || ''} {...register("email", { required: true })} className="rounded border border-slate-200 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400" />
                              }
                              {errors.email && <span className='px-2 text-red-500'>* Obligatorio</span>}
                            </div>
                          </td>
                        </tr>
                        {/* ================ */}
                        <tr>
                          <td>
                            <div className="p-4 gap-4 flex items-center">
                              <label className="text-slate-500 dark:text-slate-400 w-20 font-bold">CUD:</label>
                              {
                                viewOnly ? 
                                <Button variant="secondary" size="sm" onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onOpenModal(selectedStudent?.cudUrl)}}
                                >Ver imagen</Button>
                                :
                                <div className="flex gap-2 items-end">
                                  <input type="file" {...register("file", { required: selectedStudent?.cudUrl !== "" ? false : true })} className="rounded border border-slate-200 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400" />
                                  {selectedStudent?.cudUrl !== "" && selectedStudent?.cudUrl !== undefined && 
                                  (<Button variant="secondary" size="sm" onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onOpenModal(selectedStudent?.cudUrl)
                                  }}>Ver imagen</Button>)
                                  }
                                </div>
                              }
                              {errors.file && <span className='px-2 text-red-500'>* Obligatorio</span>}
                            </div>
                          </td>
                        </tr>
                        {/* ================ */}
                        <tr>
                          <td>
                            <div className="p-4 gap-4 flex items-center">
                              <label className="text-slate-500 dark:text-slate-400 w-20 font-bold">CUD Vto:</label>
                              {
                                viewOnly ? 
                                <label className="text-slate-500 dark:text-slate-400 w-20">{new Date(selectedStudent?.cudDueDate).toLocaleDateString('es-AR')}</label>
                                :
                                <Controller
                                  control={control}
                                  rules={{required: selectedStudent?.cudDueDate ? false : true}}
                                  value={selectedStudent?.cudDueDate}
                                  onChange={handleChange}
                                  name="cudDueDate"
                                  render={({ field: { onChange} }) => {
                                    options.defaultDate = selectedStudent?.cudDueDate ? new Date(selectedStudent?.cudDueDate) : "";
                                    return (
                                      <div className="w-48">
                                        <Datepicker options={options} onChange={onChange} show={show} setShow={handleClose} />
                                      </div>
                                  )}}
                                />
                              }
                              {errors.cudDueDate && <span className='px-2 text-red-500'>* Obligatorio</span>}
                            </div>
                          </td>
                        </tr>
                        {/* ================ */}
                        <tr>
                          <td>
                            <div className="p-4 gap-4 flex items-center">
                              <label className="text-slate-500 dark:text-slate-400 w-20 font-bold">Enseñanza:</label>
                              {
                                viewOnly ? 
                                <label className="text-slate-500 dark:text-slate-400 w-20">{getCourseName(selectedStudent?.course)}</label>
                                :
                                <select defaultValue={selectedStudent?.course || ''} {...register("course", { required: true })} className="rounded border border-slate-200 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">
                                  <option value="" disabled>Select</option>
                                  {
                                    dataCourses && dataCourses.map(course => 
                                      <option key={course._id} value={course._id}>{course.name}</option>
                                    )
                                  }
                                </select>
                              }
                              {errors.course && <span className='px-2 text-red-500'>* Obligatorio</span>}
                            </div>
                          </td>
                        </tr>
                        {/* ================ */}
                        <tr>
                          <td>
                            <div className="p-4 gap-4 flex items-center">
                              {
                                viewOnly ? 
                                  <div>
                                    <Button variant="alternativeSecondary" onClick={() => onCancel()}>Volver</Button>
                                </div>
                                :
                                  <div className="gap-4 flex">
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

            <Dialog
              open={isModalOpen}
            >
              <DialogContent>
                <div className="w-[500px] h-[400px]">
                  <div className="flex justify-end items-center text-gray-500">
                    <button onClick={onCloseModal}>
                      <CloseIcon />
                    </button>
                  </div>
                  <div className="flex justify-center items-center w-full">
                    <img src={pictureLink} className="border border-gray-200" />
                  </div>
                </div>
                <div className="flex gap-2 justify-center items-center">
                  <Button onClick={onCloseModal}>Close</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )
      }
    </div>
  );
}
