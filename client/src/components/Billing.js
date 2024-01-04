import { useNavigate } from "react-router-dom";
import React, {useState, useRef, useEffect} from "react";
import { Controller, useForm } from "react-hook-form";
import useSWR from 'swr'
import {useSWRConfig} from 'swr'
import Button from "./common/Button";
import { Dialog, DialogContent } from "./common/Dialog";
import { Pagination } from "./common/Pagination";
import Spinner from "./common/Spinner";
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
  const API_URL_WITHHOLDING = '/api/withholdings';
  const [stage, setStage] = useState('LIST');
  const [currentPage, setCurrentPage] = useState(1);
  const [show, setShow] = useState(false)
  const [billingIdForReceipt, setBillingIdForReceipt] = useState();
  const [search, setSearch] = useState('');
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isWithholdingsVisible, setIsWithholdingsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const { register, handleSubmit, trigger, control, watch, reset, formState: { errors } } = useForm();
  const { data, error, isLoading, isValidating } = useSWR(API_URL, (url) => fetch(url).then(res => res.json()))
  const {data: dataStudents} = useSWR(API_URL_STUDENTS, (url) => fetch(url).then(res => res.json()))
  const {data: dataCourses} = useSWR(API_URL_COURSES, (url) => fetch(url).then(res => res.json()))
  const {data: dataInsurances} = useSWR(API_URL_INSURANCES, (url) => fetch(url).then(res => res.json()))
  const {data: dataWithholdings} = useSWR(API_URL_WITHHOLDING, (url) => fetch(url).then(res => res.json()))

  const dataFiltered = data && data?.length > 0 && data?.filter((d) => search ? d.student.toLowerCase().includes(search.toLowerCase()) || d.invoiceNumber.toLowerCase().includes(search.toLowerCase()) : d);
  
  const dataStudentsFiltered = dataStudents && dataStudents?.length > 0 && dataStudents?.filter((d) => search ? d.name.toLowerCase().includes(search.toLowerCase()) || d.lastName.toLowerCase().includes(search.toLowerCase()) || d.healthInsuranceName.toLowerCase().includes(search.toLowerCase()) : d);

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
        receipts: [{
          receiptNumber: padStart(config.receipt.sellPoint, 5, '0') + "-" + padStart(receiptNumber, 6, '0'),
          receiptAmount: receiptAmountNumber,
          receiptDate: formData.receiptDate,
          bankName: formData.bankName,
          paymentReceiptNumber: formData.paymentReceiptNumber,
          paymentDetail: formData.paymentDetail,
        }]
      }
      const update = await mutate(API_URL, utils.patchRequest(`${API_URL}/${billingIdForReceipt}`, body), {optimisticData: true})
      reset();
      setIsWithholdingsVisible(false);
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
        rememberDate: dataInsurances.find(insurance => insurance._id === formData.insurance).daysForPayment,
        students: formData.students,
      }

      console.log(body)

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

  const getInsuranceName = (insuranceId) => {
    return dataInsurances ? dataInsurances.find(insurance => insurance._id === insuranceId)?.name || "" : "";
  }

  const onCreate = () => {
    setSelectedBilling(null);
    setStage('SELECT_STUDENTS')
  }
  
  const onCancel = () => {
    setIsWithholdingsVisible(false);
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

  const onCheckboxChange = (e) => {
    if (e.target.checked) {
      setSelectedStudents([...selectedStudents, e.target.value]);
    } else {
      setSelectedStudents(selectedStudents.filter(student => student !== e.target.value))
    }
    console.log(selectedStudents)
  }

  const onSelectAll = () => {
    setSelectedStudents(dataStudentsFiltered.map(s => s._id));
  }

  const onUnselectAll = () => {
    setSelectedStudents([]);
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
        (stage === 'LIST' || stage === 'SELECT_STUDENTS') && (
          <div className="w-full flex bg-white rounded pb-4">
            <Input autoComplete="false" rightElement={<div className="cursor-pointer" onClick={() => setSearch('')}>{search && <CloseIcon />}</div>} type="text" value={search} name="search" id="search" placeholder="Buscador..." onChange={(e) => setSearch(e.target.value)} />
          </div>
        )
      }

      {
        (stage === 'SELECT_STUDENTS') && (
          <div className="w-full align-right ml-auto">
            <Button variant="outlined" className="ml-auto" onClick={() => onSelectAll()}>Seleccionar</Button>
            <Button variant="outlined" className="ml-auto" onClick={() => onUnselectAll()}>Deseleccionar</Button>
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
                        {/* <th scope="col" className="px-6 py-4">Recibo Nro</th> */}
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
                              {/* <td className="whitespace-nowrap px-6 py-4">{billing.receiptNumber}</td> */}
                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="flex gap-4">
                                  {
                                    billing.receipts.length > 0 ? (
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
                  <h1 className="inline-block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200 pl-4 pb-4">Recibo</h1>
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
        stage === 'SELECT_STUDENTS' && (
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
                        <th scope="col" className="px-6 py-4">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        dataStudentsFiltered.length ? 
                          dataStudentsFiltered.map((student) => (
                            <tr className="border-b last:border-b-0 dark:border-neutral-500">
                              <td className="whitespace-nowrap px-6 py-4 font-medium">{student.name}</td>
                              <td className="whitespace-nowrap px-6 py-4">{student.lastName}</td>
                              <td className="whitespace-nowrap px-6 py-4">{student.course}</td>
                              <td className="whitespace-nowrap px-6 py-4">{student.healthInsuranceName}</td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <input type="checkbox" value={student._id} onChange={onCheckboxChange} checked={selectedStudents.includes(student._id)} />
                              </td>
                            </tr>
                          )) : (
                            <tr className="border-b last:border-b-0 dark:border-neutral-500">
                              <td colSpan={5} className="whitespace-nowrap px-6 py-4 font-medium">Sin registros</td>
                            </tr>
                          )
                        }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div>
              <div className="flex gap-2 justify-end items-center p-4">
                <Button variant="destructive" onClick={() => setStage('LIST')}>Cancelar</Button>
                <Button onClick={() => setStage('CREATE')}>Continuar</Button>
              </div>
            </div>
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
                              <label className="text-slate-500 dark:text-slate-400 w-24 font-bold">Estudiantes:</label>
                              {
                                <div className="overflow-hidden p-4 rounded w-[300px]">
                                  <div className="h-full bg-white flex flex-col items-start justify-start gap-2 overflow-auto">
                                    {
                                      dataStudents.map((student) => {
                                        if(selectedStudents.includes(student._id)) {
                                          return (<div className="flex gap-2">{student.name + " " + student.lastName}</div>)
                                        }
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
                                    (watch('year') === undefined && watch('month') === undefined) ? 
                                    dataCourses && dataCourses.map(course => 
                                      <option key={course._id} value={course._id}>{course.name + " " + course.month + "/" + course.year + ' $' + course.price}</option>
                                    )
                                    :
                                    dataCourses && dataCourses.filter(course => course.year === watch('year').toString() && course.month === watch('month').toString()).map(course => 
                                      <option key={course._id} value={course._id}>{course.name + " " + course.month + "/" + course.year + ' $' + course.price}</option>
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
                              <label className="text-slate-500 dark:text-slate-400 w-24 font-bold text-left">Fecha de recibo:</label>
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
                              <label className="text-slate-500 dark:text-slate-400 w-24 font-bold text-left">Importe:</label>
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
                              <label className="text-slate-500 dark:text-slate-400 w-24 font-bold text-left">Banco:</label>
                              {
                                <div className="flex gap-2">
                                  <input {...register("bankName", { required: true })} className="rounded border border-slate-200 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400" />
                                </div>
                              }
                              {(errors.bankName) && <span className='px-2 text-red-500'>* Obligatorio</span>}
                            </div>
                          </td>
                        </tr>
                        {/* ================ */}
                        <tr>
                          <td>
                            <div className="p-4 gap-4 flex items-center">
                              <label className="text-slate-500 dark:text-slate-400 w-24 font-bold text-left">Nro de Comprobante:</label>
                              {
                                <div className="flex gap-2">
                                  <input {...register("paymentReceiptNumber", { required: true })} className="rounded border border-slate-200 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400" />
                                </div>
                              }
                              {(errors.paymentReceiptNumber) && <span className='px-2 text-red-500'>* Obligatorio</span>}
                            </div>
                          </td>
                        </tr>
                        {/* ================ */}
                        <tr>
                          <td>
                          <div className="p-4 gap-4 flex items-center">
                              <label className="text-slate-500 dark:text-slate-400 w-20 font-bold text-left">Forma de Pago:</label>
                              {
                                <select defaultValue={''} {...register("paymentDetail", { required: true })} className="rounded border border-slate-200 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400">
                                  <option value="" disabled>Seleccionar</option>
                                    <option key={'1'} value={'Efectivo'}>{'Efectivo'}</option>
                                    <option key={'2'} value={'Cheque'}>{'Cheque'}</option>
                                    <option key={'3'} value={'Deposito'}>{'Deposito'}</option>
                                </select>
                              }
                              {errors.paymentDetail && <span className='px-2 text-red-500'>* Obligatorio</span>}
                            </div>
                          </td>
                        </tr>
                        {/* ================ */}
                        <tr>
                          <td><div className="cursor-pointer" onClick={() => setIsWithholdingsVisible(!isWithholdingsVisible)}>
                            {!isWithholdingsVisible ? 'Ver retenciones' : 'Ocultar retenciones'}
                          </div></td>
                        </tr>
                        {/* ================ */}
                        {/* ================ */}
                        {/* ================ */}
                        {/* TEEESSSSTTTT */}
                        {
                          isWithholdingsVisible && (
                            dataWithholdings.map((withholding, index) => {
                              const fieldName = `withholdingName1${index}`;
                              return (<tr>
                                  <td>
                                    <div className="p-4 gap-4 flex items-center">
                                      <label className="text-slate-500 dark:text-slate-400 w-24 font-bold text-left">{`${withholding.name}:`}</label>
                                      {
                                        <div className="flex gap-2">
                                          <input defaultValue={0} {...register(fieldName, { required: true })} className="rounded border border-slate-200 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400" />
                                        </div>
                                      }
                                    </div>
                                  </td>
                                </tr>
                              )
                            })
                          )
                        }
                            
                        {/* TEEESSSSTTTT */}
                        {/* ================ */}
                        {/* ================ */}
                        {/* ================ */}

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
