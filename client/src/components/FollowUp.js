import { useNavigate } from "react-router-dom";
import React, {useState} from "react";
import { Controller, useForm } from "react-hook-form";
import useSWR from 'swr'
import {useSWRConfig} from 'swr'
import Button from "./common/Button";
import { Dialog, DialogContent } from "./common/Dialog";
import { Pagination } from "./common/Pagination";
import Spinner from "./common/Spinner";
import {TestTable} from "./TestTable";
import {TrashIcon, ChecktIcon, EyeIcon, EditIcon, CloseIcon} from "./icons";
import { Input } from "./common/Input";
import * as utils from '../utils/utils'
import Datepicker from "tailwind-datepicker-react"
import { ArrowLeftIcon, ArrowRightIcon } from "./icons";
import { union, uniqBy, concat, split, padStart, slice, range } from "lodash";
import {config} from '../config';
var moment = require('moment');

const options = utils.getDatePickerOptions(ArrowLeftIcon, ArrowRightIcon)

export default function Billings() {

  const [stage, setStage] = useState('LIST');
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [show, setShow] = useState(false)
  const [selectedBilling, setSelectedBilling] = useState(null);
  const { register, handleSubmit, trigger, control, reset, formState: { errors } } = useForm();
  const API_URL = '/api/billings';
  const API_URL_NOTIFICATIONS_NOW = '/api/notifications/add/0';
  const API_URL_NOTIFICATIONS_WEEK = '/api/notifications/add/7';
  const API_URL_NOTIFICATIONS_2WEEK = '/api/notifications/add/15';
  const { mutate } = useSWRConfig()
  const { data: dataNow, error: errorNow, isLoading: isLoadingNow, isValidating: isValidatingNow } = useSWR(API_URL_NOTIFICATIONS_NOW, (url) => fetch(url).then(res => res.json()))
  const { data: dataWeek, error: errorWeek, isLoading: isLoadingWeek, isValidating: isValidatingWeek } = useSWR(API_URL_NOTIFICATIONS_WEEK, (url) => fetch(url).then(res => res.json()))
  const { data: data2Week, error: error2Week, isLoading: isLoading2Week, isValidating: isValidating2Week } = useSWR(API_URL_NOTIFICATIONS_2WEEK, (url) => fetch(url).then(res => res.json()))

  const isLoading = isLoadingNow & isLoadingWeek & isLoading2Week;
  const isValidating = isValidatingNow & isValidatingWeek & isValidating2Week;
  const error = errorNow & errorWeek & error2Week;
  const data = uniqBy(union(dataNow, dataWeek, data2Week), "_id");

  const onEdit = (billingId) => {
    const billing = data.find(bill => bill._id === billingId) || null;
    setSelectedBilling(billing);
    setStage('EDIT')
  }
  const handleClose = (state) => {
		setShow(state)
	}

  const onSubmit = async (formData) => {
    try {
      setIsLoadingSubmit(true);
      const body = {
        details: [...selectedBilling.details, moment().format('DD/MM/YYYY') + ' ' + formData.details],
        rememberDate: formData.rememberDate,
      }
      await mutate(API_URL, utils.patchRequest(`${API_URL}/${selectedBilling._id}`, body), {optimisticData: true})

      setSelectedBilling(null);
      reset()
      setIsLoadingSubmit(false)
      setStage('LIST')
    } catch (e) {
      console.log(e);
    }
  }

  const onCancel = () => {
    setSelectedBilling(null);
    reset()
    setStage('LIST')
  }


  return (
    <div className="px-4 h-full overflow-auto mt-4">
      <div className="w-full flex sticky top-0 z-10 bg-white rounded pb-4">
        <h1 className="inline-block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200">Seguimiento</h1>
      </div>

      {
        !!(isLoading || isValidating) && (
          <div>
            <Spinner />
          </div>
        )
      }
      {
        !!error && (
          <div className="text-red-500">
            {/* ERROR... */}
          </div>
        )
      }
      {
        stage === 'LIST' && data && !isValidating && !isLoading && (

          <div className="flex flex-col overflow-x-auto">
            <div className="sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                <div className="overflow-x-auto rounded-xl border">
                  <table className="min-w-full text-left text-sm font-light rounded-xl">
                    <thead className="border-b font-medium dark:border-neutral-500 bg-slate-50 rounded-xl">
                      <tr className="text-slate-400">
                        <th scope="col" className="px-6 py-4">Fecha</th>
                        <th scope="col" className="px-6 py-4">Nro de Factura</th>
                        <th scope="col" className="px-6 py-4">Periodo</th>
                        <th scope="col" className="px-6 py-4">Concepto</th>
                        <th scope="col" className="px-6 py-4">Estudiante</th>
                        <th scope="col" className="px-6 py-4">Importe</th>
                        <th scope="col" className="px-6 py-4">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        data.length ?
                          data.map((billing) => (
                            <tr className="border-b last:border-b-0 dark:border-neutral-500">
                              <td className="whitespace-nowrap px-6 py-4 font-medium">{moment(billing.rememberDate).format('DD-MM-YYYY')}</td>
                              <td className="whitespace-nowrap px-6 py-4 font-medium">{billing.invoiceNumber}</td>
                              <td className="whitespace-nowrap px-6 py-4">{billing.period}</td>
                              <td className="whitespace-nowrap px-6 py-4">{billing.concept}</td>
                              <td className="whitespace-nowrap px-6 py-4">{billing.student}</td>
                              <td className="whitespace-nowrap px-6 py-4">${billing.invoiceAmount}</td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="flex gap-4">
                                  <button className="flex items-center justify-center w-8 h-8" title="Editar" onClick={() => onEdit(billing._id)}><EditIcon/></button>
                                </div>
                              </td>
                            </tr>
                          )) : (
                            <tr className="border-b last:border-b-0 dark:border-neutral-500">
                              <td colSpan={6} className="whitespace-nowrap px-6 py-4 font-medium">Sin registros</td>
                            </tr>
                          )
                        }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {
        stage === 'EDIT' && !isLoading && (
          <div className="my-4">
            <div className="not-prose relative bg-slate-50 rounded-xl overflow-hidden dark:bg-slate-800/25">
              <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" style={{"backgroundPosition": "10px 10px"}}></div>
              <div className="relative rounded-xl overflow-auto">
                <div className="shadow-sm overflow-hidden my-8">
                  {selectedBilling && (
                    <div className="p-4 w-full bg-white">
                      <div>
                        <label className="text-slate-500 dark:text-slate-400 pr-6 w-10 font-bold">Fecha de Factua</label>
                        <label className="text-slate-500 dark:text-slate-400 w-20">{moment(selectedBilling.invoiceDate).format('DD/MM/YYYY')}</label>
                      </div>
                      <div>
                        <label className="text-slate-500 dark:text-slate-400 pr-6 w-10 font-bold">Importe</label>
                        <label className="text-slate-500 dark:text-slate-400 w-20">{utils.formatPriceSimbol(selectedBilling.invoiceAmount)}</label>
                      </div>

                      <div>
                        <label className="text-slate-500 dark:text-slate-400 pr-6 w-10 font-bold">Historico</label>
                        <ul className="list-disc pl-4">
                          {selectedBilling.details.map(detail => {
                            return (
                              <li className="pl-2 text-slate-500">{detail}</li>
                            ) 
                          })}
                        </ul>
                      </div>

                      <form onSubmit={handleSubmit(onSubmit)} className='w-full flex flex-col'>
                        <table className="border-collapse table-fixed w-full bg-white">
                          <tbody>
                            <tr>
                              <td>
                                <div className="p-4 pl-0 gap-2 flex items-center">
                                  <label className="text-slate-500 dark:text-slate-400 font-bold">Observaciones:</label>
                                  {
                                    <textarea {...register("details", { required: true })} className="rounded border border-slate-200 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400" />
                                  }
                                  {errors.details && <span className='px-2 text-red-500'>* Obligatorio</span>}
                                </div>
                              </td>
                            </tr>
                            {/* ================ */}
                            <tr>
                              <td>
                                <div className="p-4 pl-0 gap-4 flex items-center">
                                  <label className="text-slate-500 dark:text-slate-400 font-bold">Recordatorio:</label>
                                  {
                                    <Controller
                                      control={control}
                                      rules={{required: selectedBilling?.rememberDate ? false : true}}
                                      value={selectedBilling?.rememberDate}
                                      onChange={(data) => {console.log(data)}}
                                      name="rememberDate"
                                      render={({ field: { onChange} }) => {
                                        // options.defaultDate = selectedBilling?.rememberDate ? new Date(selectedBilling?.rememberDate) : "";
                                        options.defaultDate = null;
                                        return (
                                          <div className="w-48">
                                            <Datepicker options={options} onChange={onChange} show={show} setShow={handleClose} />
                                          </div>
                                      )}}
                                    />
                                  }
                                  {errors.rememberDate && <span className='px-2 text-red-500'>* Obligatorio</span>}
                                </div>
                              </td>
                            </tr>
                            {/* ================ */}
                            <tr>
                              <td>
                                <div className="p-4 gap-4 flex items-center">
                                  {
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
                  )}
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
