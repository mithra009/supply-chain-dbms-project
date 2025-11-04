import React, { createContext, useContext, useState } from 'react'

const OperationLogContext = createContext(null)

export function OperationLogProvider({ children }){
  const [logs, setLogs] = useState([])

  function addLog(operation, endpoint, sql, file, description, category){
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      operation,
      endpoint,
      sql,
      file,
      description,
      category // e.g., 'products', 'warehouses', 'inventory', 'orders', 'client-orders', 'auth'
    }
    setLogs(prev => [newLog, ...prev].slice(0, 100)) // Keep last 100 logs
  }

  function clearLogs(){
    setLogs([])
  }

  function getLogsByCategory(category){
    if (!category) return logs
    return logs.filter(log => log.category === category)
  }

  return (
    <OperationLogContext.Provider value={{ logs, addLog, clearLogs, getLogsByCategory }}>
      {children}
    </OperationLogContext.Provider>
  )
}

export function useOperationLog(){
  return useContext(OperationLogContext)
}
