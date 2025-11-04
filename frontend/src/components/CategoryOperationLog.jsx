import React from 'react'
import { useOperationLog } from '../operationLog'

export default function CategoryOperationLog({ category, title = "Database Operations" }){
  const { getLogsByCategory, clearLogs } = useOperationLog()
  const filteredLogs = getLogsByCategory(category)

  if (filteredLogs.length === 0) {
    return null // Don't show if no operations yet
  }

  return (
    <div style={{
      marginTop: 20,
      padding: 16,
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: 4
    }}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
        <h4 style={{margin: 0, color: '#495057'}}>{title}</h4>
        <button 
          onClick={clearLogs}
          style={{
            padding: '4px 12px',
            fontSize: 12,
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: 3,
            cursor: 'pointer'
          }}
        >
          Clear All Logs
        </button>
      </div>
      
      <div style={{
        maxHeight: 400,
        overflowY: 'auto',
        backgroundColor: '#ffffff',
        border: '1px solid #dee2e6',
        borderRadius: 4
      }}>
        {filteredLogs.map(log => (
          <div 
            key={log.id} 
            style={{
              padding: 12,
              borderBottom: '1px solid #e9ecef',
              fontSize: 13
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 6
            }}>
              <strong style={{color: '#007bff', fontSize: 14}}>{log.operation}</strong>
              <span style={{color: '#6c757d', fontSize: 11}}>{log.timestamp}</span>
            </div>
            
            <div style={{marginBottom: 4}}>
              <span style={{
                backgroundColor: '#e7f3ff',
                color: '#0066cc',
                padding: '2px 8px',
                borderRadius: 3,
                fontSize: 12,
                fontFamily: 'monospace',
                fontWeight: 'bold'
              }}>
                {log.endpoint}
              </span>
            </div>
            
            <div style={{marginBottom: 4, fontSize: 12, color: '#6c757d'}}>
              File: {log.file}
            </div>
            
            <div style={{
              backgroundColor: '#282c34',
              color: '#abb2bf',
              padding: 8,
              borderRadius: 3,
              fontFamily: 'monospace',
              fontSize: 12,
              marginBottom: 4,
              overflowX: 'auto',
              whiteSpace: 'pre-wrap'
            }}>
              {log.sql}
            </div>
            
            <div style={{fontSize: 12, color: '#495057', fontStyle: 'italic'}}>
              {log.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
