import React, {useState} from "react";
import { useForm } from "react-hook-form";
import useSWR from 'swr'
import {useSWRConfig} from 'swr'
import Button from "./common/Button";
import Spinner from "./common/Spinner";
import {EditIcon, TrashIcon, EyeIcon} from "./icons";
import * as utils from '../utils/utils'

export default function Insurances() {

  const API_URL = '/api/insurances';
  const [stage, setStage] = useState('LIST');
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { data, error, isLoading, isValidating } = useSWR(API_URL, (url) => fetch(url).then(res => res.json()))
  const { mutate } = useSWRConfig()

  if (error) console.log(error)

  const removeInsurance = async (insuranceId) => {
    if (window.confirm("Seguro desea eliminar esta cobertura?")) {
      try {
        await mutate(API_URL, utils.deleteRequest(`${API_URL}/${insuranceId}`), {optimisticData: true})
      } catch (e) {
        console.log(e);
      }
    }
  }

  const onSubmit = async (data) => {
    try {
      setIsLoadingSubmit(true)
      if (selectedInsurance) {
        await mutate(API_URL, utils.patchRequest(`${API_URL}/${selectedInsurance._id}`, data), {optimisticData: true})
      }else{
        await mutate(API_URL, utils.postRequest(API_URL, data), {optimisticData: true})
      }
      setIsLoadingSubmit(false)
      setStage('LIST')
    } catch (e) {
      console.log(e);
    }
  }

  const onEdit = (insuranceId) => {
    reset()
    const insurance = data.find(insurance => insurance._id === insuranceId) || null;
    setSelectedInsurance(insurance);
    setStage('CREATE')
  }

  const onView = (insuranceId) => {
    const insurance = data.find(insurance => insurance._id === insuranceId) || null;
    setSelectedInsurance(insurance);
    setViewOnly(true)
    setStage('CREATE')
  }

  const onCreate = () => {
    setSelectedInsurance(null);
    setStage('CREATE')
  }
  
  const onCancel = () => {
    setSelectedInsurance(null);
    setViewOnly(false)
    reset()
    setStage('LIST')
  }

  const billingDayValidation = (billingDay) => {
    return billingDay > 0 && billingDay < 29;
  }

  const insuranceNameValidation = (name) => {
    if (!viewOnly) return null;
    return !data.find(insurance => insurance.name === name);
  }

  const cuitValidation = (cuit) => {
    if (!viewOnly) return null;
    return !data.find(insurance => insurance.cuit === cuit);
  }

  return (
    <div className="px-4 h-full overflow-auto mt-4">
      <div className="w-full flex sticky top-0 z-10 bg-white rounded pb-4">
        <h1 className="inline-block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200">Coberturas</h1>
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
                        <th className="border-b dark:border-slate-600 font-medium p-4 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">Plan</th>
                        <th className="border-b dark:border-slate-600 font-medium p-4 pr-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">Dia de Facturacion</th>
                        <th className="border-b dark:border-slate-600 font-medium p-4 pr-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800">
                      {
                        data.length ? 
                          data.map(insurance => (
                            <tr key={insurance._id}>
                              <td className="border-b border-slate-100 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400">{insurance.name}</td>
                              <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">{insurance.plan}</td>
                              <td className="border-b border-slate-100 dark:border-slate-700 p-4 pr-8 text-slate-500 dark:text-slate-400">{insurance.billingDay}</td>
                              <td className="border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 w-10">
                                <div className="flex gap-2">
                                  <button className="flex items-center justify-center w-8 h-8" title="Ver detalle" onClick={() => onView(insurance._id)}><EyeIcon/></button>
                                  <button className="flex items-center justify-center w-8 h-8" title="Editar" onClick={() => onEdit(insurance._id)}><EditIcon/></button>
                                  <button className="flex items-center justify-center w-8 h-8" title="Eliminar" onClick={() => removeInsurance(insurance._id)}><TrashIcon/></button>
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
                            <div className="p-4 gap-4 flex items-center">
                              <label className="text-slate-500 dark:text-slate-400 w-20 font-bold">Nombre:</label>
                              {
                                viewOnly ? 
                                <label className="text-slate-500 dark:text-slate-400 w-20">{selectedInsurance?.name}</label>
                                :
                                <input
                                  type="text"
                                  id="name"
                                  name="name"
                                  defaultValue={selectedInsurance?.name || ''}
                                  {...register("name", { required: true, validate: insuranceNameValidation })}
                                  className="rounded border border-slate-200 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400"  
                                />
                              }
                              {errors.name?.type === 'required' && <span className='px-2 text-red-500'>* Obligatorio</span>}
                              {errors.name?.type === 'validate' && <span className='px-2 text-red-500'>* Nombre existente</span>}
                            </div>
                          </td>
                        </tr>
                        {/* ================ */}
                        {/* ================ */}
                        <tr>
                          <td>
                            <div className="p-4 gap-4 flex items-center">
                              <label className="text-slate-500 dark:text-slate-400 w-20 font-bold">CUIT:</label>
                              {
                                viewOnly ? 
                                <label className="text-slate-500 dark:text-slate-400 w-20">{selectedInsurance?.cuit}</label>
                                :
                                <input
                                  type="number"
                                  id="cuit"
                                  defaultValue={selectedInsurance?.cuit || ''}
                                  name="cuit"
                                  {...register("cuit", { required: true, validate: cuitValidation })}
                                  className="rounded border border-slate-200 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400"  
                                />
                              }
                              {errors.cuit?.type === 'required' && <span className='px-2 text-red-500'>* Obligatorio</span>}
                              {errors.cuit?.type === 'validate' && <span className='px-2 text-red-500'>* CUIT existente</span>}
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
                                <label className="text-slate-500 dark:text-slate-400 w-20">{selectedInsurance?.plan}</label>
                                :
                                <input type="text" defaultValue={selectedInsurance?.plan || ''} {...register("plan", { required: true })} className="rounded border border-slate-200 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400" />
                              }
                              {errors.plan && <span className='px-2 text-red-500'>* Obligatorio</span>}
                            </div>
                          </td>
                        </tr>
                        {/* ================ */}
                        <tr>
                          <td>
                            <div className="p-4 gap-4 flex items-center">
                              <label className="text-slate-500 dark:text-slate-400 w-20 font-bold">Persona de contacto:</label>
                              {
                                viewOnly ? 
                                <label className="text-slate-500 dark:text-slate-400 w-20">{selectedInsurance?.contact}</label>
                                :
                                <input type="text" defaultValue={selectedInsurance?.contact || ''} {...register("contact", { required: true })} className="rounded border border-slate-200 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400" />
                              }
                              {errors.contact && <span className='px-2 text-red-500'>* Obligatorio</span>}
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
                                <label className="text-slate-500 dark:text-slate-400 w-20">{selectedInsurance?.email}</label>
                                :
                                <input type="text" defaultValue={selectedInsurance?.email || ''} {...register("email", { required: true })} className="rounded border border-slate-200 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400" />
                              }
                              {errors.email && <span className='px-2 text-red-500'>* Obligatorio</span>}
                            </div>
                          </td>
                        </tr>
                        {/* ================ */}
                        <tr>
                          <td>
                            <div className="p-4 gap-4 flex items-center">
                              <label className="text-slate-500 dark:text-slate-400 w-20 font-bold">Telefono:</label>
                              {
                                viewOnly ? 
                                <label className="text-slate-500 dark:text-slate-400 w-20">{selectedInsurance?.phone}</label>
                                :
                                <input type="text" defaultValue={selectedInsurance?.phone || ''} {...register("phone", { required: true })} className="rounded border border-slate-200 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400" />
                              }
                              {errors.phone && <span className='px-2 text-red-500'>* Obligatorio</span>}
                            </div>
                          </td>
                        </tr>
                        {/* ================ */}
                        <tr>
                          <td>
                            <div className="p-4 gap-4 flex items-center">
                              <label className="text-slate-500 dark:text-slate-400 w-20 font-bold">Direccion:</label>
                              {
                                viewOnly ? 
                                <label className="text-slate-500 dark:text-slate-400 w-20">{selectedInsurance?.address}</label>
                                :
                                <input type="text" defaultValue={selectedInsurance?.address || ''} {...register("address", { required: true })} className="rounded border border-slate-200 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400" />
                              }
                              {errors.address && <span className='px-2 text-red-500'>* Obligatorio</span>}
                            </div>
                          </td>
                        </tr>
                        {/* ================ */}
                        <tr>
                          <td>
                            <div className="p-4 gap-4 flex items-center">
                              <label className="text-slate-500 dark:text-slate-400 w-20 font-bold">Localidad:</label>
                              {
                                viewOnly ? 
                                <label className="text-slate-500 dark:text-slate-400 w-20">{selectedInsurance?.city}</label>
                                :
                                <input type="text" defaultValue={selectedInsurance?.city || ''} {...register("city", { required: true })} className="rounded border border-slate-200 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400" />
                              }
                              {errors.city && <span className='px-2 text-red-500'>* Obligatorio</span>}
                            </div>
                          </td>
                        </tr>
                        {/* ================ */}
                        <tr>
                          <td>
                            <div className="p-4 gap-4 flex items-center">
                              <label className="text-slate-500 dark:text-slate-400 w-20 font-bold">Categoria:</label>
                              {
                                viewOnly ? 
                                <label className="text-slate-500 dark:text-slate-400 w-20">{selectedInsurance?.category}</label>
                                :
                                <input type="text" defaultValue={selectedInsurance?.category || ''} {...register("category", { required: true })} className="rounded border border-slate-200 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400" />
                              }
                              {errors.category && <span className='px-2 text-red-500'>* Obligatorio</span>}
                            </div>
                          </td>
                        </tr>
                        {/* ================ */}
                        <tr>
                          <td>
                            <div className="p-4 gap-4 flex items-center">
                              <label className="text-slate-500 dark:text-slate-400 w-20 font-bold">Plazo de pago:</label>
                              {
                                viewOnly ? 
                                <label className="text-slate-500 dark:text-slate-400 w-20">{selectedInsurance?.phone}</label>
                                :
                                <input type="number" defaultValue={selectedInsurance?.daysForPayment || ''} {...register("daysForPayment", { required: true })} className="rounded border border-slate-200 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400" />
                              }
                              {errors.daysForPayment && <span className='px-2 text-red-500'>* Obligatorio</span>}
                            </div>
                          </td>
                        </tr>
                        {/* ================ */}
                        <tr>
                          <td>
                            <div className="p-4 gap-4 flex items-center">
                              <label className="text-slate-500 dark:text-slate-400 w-20 font-bold">Dia de facturacion:</label>
                              {
                                viewOnly ? 
                                <label className="text-slate-500 dark:text-slate-400 w-20">{selectedInsurance?.billingDay}</label>
                                :
                                <input
                                  type="text"
                                  id="billingDay"
                                  name="billingDay"
                                  defaultValue={selectedInsurance?.billingDay || ''}
                                  {...register("billingDay", { required: true, validate: billingDayValidation })}
                                  className="rounded border border-slate-200 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400"  
                                />
                              }
                              {errors.billingDay?.type === 'required' && <span className='px-2 text-red-500'>* Obligatorio</span>}
                              {errors.billingDay?.type === 'validate' && <span className='px-2 text-red-500'>* Nro entre 1 y 28</span>}
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
          </div>
        )
      }
    </div>
  );
}
