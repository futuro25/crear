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
import {TrashIcon, ChecktIcon, EyeIcon, ReceiptIcon, CloseIcon} from "./icons";
import { Input } from "./common/Input";
import * as utils from '../utils/utils'
import Datepicker from "tailwind-datepicker-react"
import { ArrowLeftIcon, ArrowRightIcon } from "./icons";
import { split, padStart, slice, range } from "lodash";
import {config} from '../config';
var moment = require('moment');

const options = utils.getDatePickerOptions(ArrowLeftIcon, ArrowRightIcon)

export default function Billings() {

  const API_URL = '/api/billings';
  const API_URL_STUDENTS = '/api/students';
  const API_URL_COURSES = '/api/courses';
  const API_URL_INSURANCES = '/api/insurances';
  const API_URL_RECEIPT = '/api/receipt';
  const [stage, setStage] = useState('LIST');
  const [currentPage, setCurrentPage] = useState(1);
  const [show, setShow] = useState(false)
  const [billingIdForReceipt, setBillingIdForReceipt] = useState();
  const [search, setSearch] = useState('');
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const { register, handleSubmit, trigger, control, reset, formState: { errors } } = useForm();
  const { data, error, isLoading, isValidating } = useSWR(API_URL, (url) => fetch(url).then(res => res.json()))
  const {data: dataStudents} = useSWR(API_URL_STUDENTS, (url) => fetch(url).then(res => res.json()))
  const {data: dataCourses} = useSWR(API_URL_COURSES, (url) => fetch(url).then(res => res.json()))
  const {data: dataInsurances} = useSWR(API_URL_INSURANCES, (url) => fetch(url).then(res => res.json()))

  const dataFiltered = data && data?.length > 0 && data?.filter((d) => search ? d.student.toLowerCase().includes(search.toLowerCase()) || d.invoiceNumber.toLowerCase().includes(search.toLowerCase()) : d);

  const rowsPerPage = 6;
  const totalPages = Math.round(dataFiltered?.length / rowsPerPage)+1;

  const desde = (currentPage * rowsPerPage) - rowsPerPage;
  const hasta = currentPage * rowsPerPage;


  const { mutate } = useSWRConfig()
  const navigate = useNavigate();

  const months = utils.getMonths();
  const years = utils.getYears();

  if (error) console.log(error)

  const handleClose = (state) => {
		setShow(state)
	}

  const removeBilling = async (billingId) => {
    if (window.confirm("Seguro desea eliminar esta factura?")) {
      try {
        await mutate(API_URL, utils.deleteRequest(`${API_URL}/${billingId}`), {optimisticData: true})
      } catch (e) {
        console.log(e);
      }
    }
  }

  const onSubmitReceipt = async (formData) => {
    try {
      console.log('formData', formData)
      const receiptAmountNumber = utils.formatPrice(formData.receiptAmount);
      const receiptBody = {
        receiptType: config.receipt.receiptType,
        sellPoint: config.receipt.sellPoint,
        concept: config.receipt.concept,
        cuit: config.receipt.cuit,
        amount: receiptAmountNumber,
      }
      const receipt = await mutate(API_URL_RECEIPT, utils.postRequest(API_URL_RECEIPT, receiptBody), {optimisticData: true})
      console.log('receipt', receipt)
      const receiptNumber = receipt.data.FeDetResp.FECAEDetResponse[0].CbteDesde;
      const body = {
        receiptNumber: padStart(config.receipt.sellPoint, 5, '0') + "-" + padStart(receiptNumber, 6, '0'),
        receiptAmount: receiptAmountNumber,
        receiptDate: formData.receiptDate,
      }
      const update = await mutate(API_URL, utils.patchRequest(`${API_URL}/${billingIdForReceipt}`, body), {optimisticData: true})
      console.log('update', update)
      setStage('LIST')
    }catch(e){

    }
  }

  const onSubmit = async (formData) => {
    try {
      setIsLoadingSubmit(true);

      const itemToBill = dataCourses.find(course => course._id === formData.course);
      const invoiceAmountNumber = utils.formatPrice(itemToBill.price);

      const invoiceBody = {
        receiptType: config.invoice.receiptType,
        sellPoint: config.invoice.sellPoint,
        concept: config.invoice.concept,
        cuit: config.invoice.cuit,
        amount: invoiceAmountNumber,
      }

      const invoice = await mutate(API_URL_RECEIPT, utils.postRequest(API_URL_RECEIPT, invoiceBody), {optimisticData: true})

      const cae = invoice.data.FeDetResp.FECAEDetResponse[0].CAE;
      const caeDueDate = invoice.data.FeDetResp.FECAEDetResponse[0].CAEFchVto;
      const receiptNumber = invoice.data.FeDetResp.FECAEDetResponse[0].CbteDesde;

      const body = {
        invoiceNumber: padStart(config.invoice.sellPoint, 5, '0') + "-" + padStart(receiptNumber, 6, '0'),
        cae: cae,
        caeDueDate: caeDueDate,
        invoiceAmount: invoiceAmountNumber,
        invoiceDate: new Date(),
        insurance: formData.insurance,
        period: formData.month + " " + formData.year,
        concept: itemToBill.name,
        details: [formData.details],
        receiptNumber: null,
        receiptAmount: null,
        receiptDate: null,
        rememberDate: formData.rememberDate,
        students: formData.students,
      }

      await mutate(API_URL, utils.postRequest(API_URL, body), {optimisticData: true})
      setIsLoadingSubmit(false)
      setStage('LIST')
    } catch (e) {
      console.log(e);
    }
  }

  const onView = (billingId) => {
    navigate("/factura/"+billingId);
  }

  const onAddReceipt = (selectedBillingId) => {
    setBillingIdForReceipt(selectedBillingId)
    setStage('RECEIPT')
  }

  const onCreate = () => {
    setSelectedBilling(null);
    setStage('CREATE')
  }
  
  const onCancel = () => {
    setSelectedBilling(null);
    reset()
    setStage('LIST')
  }

  const onViewReceipt = (billingId) => {
    setSelectedBilling(billingId);
    setIsModalOpen(true);
  }

  const getReceiptInfo = () => {
    const bill = data.find(bill => bill._id === selectedBilling) || "";

    return (
      <div className="p-4 w-full">
        <div>
          <label className="text-slate-500 dark:text-slate-400 pr-6 w-10 font-bold">Fecha de Recibo</label>
          <label className="text-slate-500 dark:text-slate-400 w-20">{moment(bill.receiptDate).format('DD/MM/YYYY')}</label>
        </div>
        <div>
          <label className="text-slate-500 dark:text-slate-400 pr-6 w-10 font-bold">Nro de Recibo</label>
          <label className="text-slate-500 dark:text-slate-400 w-20">{bill.receiptNumber}</label>
        </div>
        <div>
          <label className="text-slate-500 dark:text-slate-400 pr-6 w-10 font-bold">Importe</label>
          <label className="text-slate-500 dark:text-slate-400 w-20">{bill.receiptAmount}</label>
        </div>
      </div>
    )
  }

  const getStudentName = (studentId) => {
    const student = dataStudents ? dataStudents.find(student => student._id === studentId) : "";
    return student?.name + " " + student?.lastName;
  }

  const getPeriod = (period) => {
    const data = split(period, " ");
    return months[data[0]].name + " " + data[1];
  }

  return (
    <div className="px-4 h-full overflow-auto mt-4">
      <div className="w-full flex sticky top-0 z-10 bg-white rounded pb-4">
        <h1 className="inline-block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200">Facturacion</h1>
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
        stage === 'TEST' && (
          <TestTable />
        )
      }
      {
        stage === 'LIST' && data && !isValidating && (
          // <div className="my-4 min-w-[1000px] overflow-x-auto">
          //   <div className="not-prose relative bg-slate-50 rounded-xl overflow-hidden dark:bg-slate-800/25">
          //     <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" style={{"backgroundPosition": "10px 10px"}}></div>
          //     <div className="relative rounded-xl overflow-x-auto">
          //       <div className="shadow-sm overflow-hidden my-8">
          //         <table className="border-collapse table-fixed w-full text-sm">
          //           <thead>
          //             <tr>
          //               <th className="border-b dark:border-slate-600 font-medium p-4 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">Nro de Factura</th>
          //               <th className="border-b dark:border-slate-600 font-medium p-4 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">Periodo</th>
          //               <th className="border-b dark:border-slate-600 font-medium p-4 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">Concepto</th>
          //               <th className="border-b dark:border-slate-600 font-medium p-4 pr-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">Estudiante</th>
          //               <th className="border-b dark:border-slate-600 font-medium p-4 pr-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">Importe</th>
          //               <th className="border-b dark:border-slate-600 font-medium p-4 pr-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left">Acciones</th>
          //             </tr>
          //           </thead>
          //           <tbody className="bg-white dark:bg-slate-800">
          //             {
          //               dataFiltered.length ?
          //                 slice(dataFiltered, desde, hasta).map((billing) => (
          //                   <tr key={billing._id}>
          //                     <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">{billing.invoiceNumber}</td>
          //                     <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">{getPeriod(billing.period)}</td>
          //                     <td className="border-b border-slate-100 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">{billing.concept}</td>
          //                     <td className="border-b border-slate-100 dark:border-slate-700 p-4 pr-8 text-slate-500 dark:text-slate-400">{billing.student}</td>
          //                     <td className="border-b border-slate-100 dark:border-slate-700 p-4 pr-8 text-slate-500 dark:text-slate-400">${billing.invoiceAmount}</td>
          //                     <td className="border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 w-10">
          //                       <div className="flex gap-4">
          //                         <button className="flex items-center justify-center w-8 h-8" title="Ver detalle" onClick={() => onView(billing._id)}><EyeIcon/></button>
          //                         {
          //                           !!billing.receiptNumber ? (
          //                             // <button className="flex items-center justify-center w-8 h-8" title="Agregar Recibo" onClick={() => onAddReceipt(billing._id)}><ReceiptIcon/></button>
          //                             <button className="flex items-center justify-center w-8 h-8" title="Ver Recibo" onClick={() => onViewReceipt(billing._id)}><ReceiptIcon/></button>
          //                           ) : (
          //                             <button className="flex items-center justify-center w-8 h-8" title="Agregar Recibo" onClick={() => onAddReceipt(billing._id)}><ReceiptIcon/></button>
          //                           )
          //                         }
          //                         <button className="flex items-center justify-center w-8 h-8" title="Eliminar" onClick={() => removeBilling(billing._id)}><TrashIcon/></button>
          //                       </div>
          //                     </td>
          //                   </tr>
          //                 ))
          //                 :
          //                 (
          //                   <tr>
          //                     <td colSpan={6} className="border-b border-slate-100 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">No data</td>
          //                   </tr>
          //                 )
          //             }
          //           </tbody>
          //         </table>
          //       </div>
          //     </div>
          //     <div className="absolute inset-0 pointer-events-none border border-black/5 rounded-xl dark:border-white/5"></div>
          //   </div>

          //   <div className="flex gap-2 justify-center items-center p-4">
          //     <Pagination onChange={(page) => {setCurrentPage(page); console.log(page)}} totalPages={totalPages} currentPage={currentPage} />
          //   </div>

          //   <Dialog
          //     open={isModalOpen}
          //   >
          //     <DialogContent>
          //       <div className="w-[500px] h-[400px]">
          //         <div className="flex justify-end items-center text-gray-500">
          //           <button onClick={() => setIsModalOpen(false)}>
          //             <CloseIcon />
          //           </button>
          //         </div>
          //         <div className="flex justify-center items-center w-full">
          //           {
          //             getReceiptInfo()
          //           }
          //         </div>
          //       </div>
          //       <div className="flex gap-2 justify-center items-center">
          //         <Button onClick={() => setIsModalOpen(false)}>Close</Button>
          //       </div>
          //     </DialogContent>
          //   </Dialog>
          // </div>

          <div className="flex flex-col overflow-x-auto">
            <div className="sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                <div className="overflow-x-auto rounded-xl border">
                  <table className="min-w-full text-left text-sm font-light rounded-xl">
                    <thead className="border-b font-medium dark:border-neutral-500 bg-slate-50 rounded-xl">
                      <tr className="text-slate-400">
                        <th scope="col" className="px-6 py-4">Nro de Factura</th>
                        <th scope="col" className="px-6 py-4">Periodo</th>
                        <th scope="col" className="px-6 py-4">Concepto</th>
                        <th scope="col" className="px-6 py-4">Estudiante</th>
                        <th scope="col" className="px-6 py-4">Importe</th>
                        <th scope="col" className="px-6 py-4">Recibo Nro</th>
                        <th scope="col" className="px-6 py-4">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        dataFiltered.length ?
                          slice(dataFiltered, desde, hasta).map((billing) => (
                            <tr className="border-b last:border-b-0 dark:border-neutral-500">
                              <td className="whitespace-nowrap px-6 py-4 font-medium">{billing.invoiceNumber}</td>
                              <td className="whitespace-nowrap px-6 py-4">{getPeriod(billing.period)}</td>
                              <td className="whitespace-nowrap px-6 py-4">{billing.concept}</td>
                              <td className="whitespace-nowrap px-6 py-4">{billing.student}</td>
                              <td className="whitespace-nowrap px-6 py-4">${billing.invoiceAmount}</td>
                              <td className="whitespace-nowrap px-6 py-4">{billing.receiptNumber}</td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="flex gap-4">
                                  {
                                    !billing.receiptNumber ? (
                                      <button className="flex items-center justify-center w-8 h-8" title="Agregar Recibo" onClick={() => onAddReceipt(billing._id)}><ReceiptIcon/></button>
                                    ) : (
                                      <button className="flex items-center justify-center w-8 h-8" title="Ver Recibo" onClick={() => onViewReceipt(billing._id)}><ChecktIcon/></button>
                                    )
                                  }
                                  <button className="flex items-center justify-center w-8 h-8" title="Ver detalle" onClick={() => onView(billing._id)}><EyeIcon/></button>
                                  <button className="flex items-center justify-center w-8 h-8" title="Eliminar" onClick={() => removeBilling(billing._id)}><TrashIcon/></button>
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

            <div className="flex gap-2 justify-center items-center p-4">
              <Pagination onChange={(page) => setCurrentPage(page)} totalPages={totalPages} currentPage={currentPage} />
            </div>

            <Dialog open={isModalOpen}>
              <DialogContent>
                <div className="w-[500px] h-[400px]">
                  <div className="flex justify-end items-center text-gray-500">
                    <button onClick={() => setIsModalOpen(false)}>
                      <CloseIcon />
                    </button>
                  </div>
                  <h1 class="inline-block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200 pl-4 pb-4">Recibo</h1>
                  <div className="flex justify-center items-center w-full">
                    {
                      getReceiptInfo()
                    }
                  </div>
                </div>
                <div className="flex gap-2 justify-center items-center">
                  <Button onClick={() => setIsModalOpen(false)}>Close</Button>
                </div>
              </DialogContent>
            </Dialog>

          </div>
        )
      }

      {
        stage === 'CREATE' && (
          <div className="my-4">
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
                              <label className="text-slate-500 dark:text-slate-400 w-24 font-bold">Estudiante:</label>
                              {
                                <div className="h-[200px] border border-slate-200 overflow-hidden p-4 rounded w-[300px]">
                                  <div className="h-full bg-white flex flex-col items-start justify-start gap-2 overflow-auto">
                                    {
                                      dataStudents.map((student) => {
                                        return (
                                          <div className="flex gap-2">
                                            <input
                                              name="students"
                                              type="checkbox"
                                              id={student._id}
                                              value={student.name + " " + student.lastName}
                                              {...register("students", { required: 'Please select students' })}
                                            />
                                            <label className="w-full" htmlFor={student._id}>{`${student.name} ${student.lastName}`}</label>
                                          </div>
                                        )
                                      })
                                    }
                                  </div>
                                </div>
                              }
                              {errors.students && <span className='px-2 text-red-500'>* Obligatorio</span>}
                            </div>
                          </td>
                        </tr>
                        {/* ================ */}
                        <tr>
                          <td>
                            <div className="p-4 gap-4 flex items-center">
                              <label className="text-slate-500 dark:text-slate-400 w-24 font-bold">Periodo facturado:</label>
                              {
                                <div className="flex gap-2">
                                  <select {...register("month", { required: true })} className="rounded border border-slate-200 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">
                                    <option value="" disabled>Select</option>
                                    {
                                      months.map(month => 
                                        <option key={month.id} value={month.id}>{month.name}</option>
                                      )
                                    }
                                  </select>

                                  <select {...register("year", { required: true })} className="rounded border border-slate-200 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">
                                    <option value="" disabled>Select</option>
                                    {
                                      years.map(year => 
                                        <option key={year.id} value={year.id}>{year.name}</option>
                                      )
                                    }
                                  </select>
                                </div>
                              }
                              {(errors.month || errors.year) && <span className='px-2 text-red-500'>* Obligatorio</span>}
                            </div>
                          </td>
                        </tr>
                        {/* ================ */}
                        <tr>
                          <td>
                            <div className="p-4 gap-4 flex items-center">
                              <label className="text-slate-500 dark:text-slate-400 w-24 font-bold">Item a facturar:</label>
                              {
                                <select defaultValue={selectedBilling?.course || ''} {...register("course", { required: true })} className="rounded border border-slate-200 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">
                                  <option value="" disabled>Select</option>
                                  {
                                    dataCourses && dataCourses.map(course => 
                                      <option key={course._id} value={course._id}>{course.name + ' $' + course.price}</option>
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
                              <label className="text-slate-500 dark:text-slate-400 w-24 font-bold">Cobertura:</label>
                              {
                                <select defaultValue={selectedBilling?.insurance || ''} {...register("insurance", { required: true })} className="rounded border border-slate-200 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">
                                  <option value="" disabled>Select</option>
                                  {
                                    dataInsurances && dataInsurances.map(insurance => 
                                      <option key={insurance._id} value={insurance._id}>{insurance.name}</option>
                                    )
                                  }
                                </select>
                              }
                              {errors.insurance && <span className='px-2 text-red-500'>* Obligatorio</span>}
                            </div>
                          </td>
                        </tr>
                        {/* ================ */}
                        <tr>
                          <td>
                            <div className="p-4 gap-4 flex items-center">
                              <label className="text-slate-500 dark:text-slate-400 w-24 font-bold">Observaciones:</label>
                              {
                                <textarea defaultValue={selectedBilling?.details || ''} {...register("details", { required: true })} className="rounded border border-slate-200 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400" />
                              }
                              {errors.details && <span className='px-2 text-red-500'>* Obligatorio</span>}
                            </div>
                          </td>
                        </tr>
                        {/* ================ */}
                        <tr>
                          <td>
                            <div className="p-4 gap-4 flex items-center">
                              <label className="text-slate-500 dark:text-slate-400 w-20 font-bold">Recordatorio:</label>
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
              </div>
              <div className="absolute inset-0 pointer-events-none border border-black/5 rounded-xl dark:border-white/5"></div>
            </div>
          </div>
        )
      }

      {
        stage === 'RECEIPT' && (
          <div className="my-4">
            <div className="not-prose relative bg-slate-50 rounded-xl overflow-hidden dark:bg-slate-800/25">
              <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" style={{"backgroundPosition": "10px 10px"}}></div>
              <div className="relative rounded-xl overflow-auto">
                <div className="shadow-sm overflow-hidden my-8 min-h-[400px] bg-white">
                  <form onSubmit={handleSubmit(onSubmitReceipt)} className='w-full flex flex-col'>
                    <table className="border-collapse table-fixed w-full text-sm bg-white">
                      <tbody>
                        {/* ================ */}
                        <tr>
                          <td>
                            <div className="p-4 gap-4 flex items-center">
                              <label className="text-slate-500 dark:text-slate-400 w-24 font-bold">Fecha de recibo:</label>
                              {
                                <Controller
                                  control={control}
                                  rules={{required: selectedBilling?.receiptDate ? false : true}}
                                  value={selectedBilling?.receiptDate}
                                  onChange={(data) => {console.log(data)}}
                                  name="receiptDate"
                                  render={({ field: { onChange} }) => {
                                    options.defaultDate = null;
                                    return (
                                      <div className="w-48">
                                        <Datepicker options={options} onChange={onChange} show={show} setShow={handleClose} />
                                      </div>
                                  )}}
                                />
                              }
                              {errors.receiptDate && <span className='px-2 text-red-500'>* Obligatorio</span>}
                            </div>
                          </td>
                        </tr>
                        {/* ================ */}
                        <tr>
                          <td>
                            <div className="p-4 gap-4 flex items-center">
                              <label className="text-slate-500 dark:text-slate-400 w-24 font-bold">Nro de Recibo:</label>
                              {
                                <div className="flex gap-2">
                                  <input {...register("receiptNumber", { required: true })} className="rounded border border-slate-200 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400" />
                                </div>
                              }
                              {(errors.receiptNumber) && <span className='px-2 text-red-500'>* Obligatorio</span>}
                            </div>
                          </td>
                        </tr>
                        {/* ================ */}
                        <tr>
                          <td>
                            <div className="p-4 gap-4 flex items-center">
                              <label className="text-slate-500 dark:text-slate-400 w-24 font-bold">Importe:</label>
                              {
                                <div className="flex gap-2">
                                  <input {...register("receiptAmount", { required: true })} className="rounded border border-slate-200 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400" />
                                </div>
                              }
                              {(errors.receiptAmount) && <span className='px-2 text-red-500'>* Obligatorio</span>}
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
              </div>
              <div className="absolute inset-0 pointer-events-none border border-black/5 rounded-xl dark:border-white/5"></div>
            </div>
          </div>
        )
      }
    </div>
  );
}
