import React from 'react'
import { useOperationLog } from '../operationLog.jsx'

export default function OperationLogViewer(){
  const { logs, clearLogs } = useOperationLog()

  return (
    <div style={{position:'fixed',bottom:0,left:0,right:0,maxHeight:'300px',overflowY:'auto',backgroundColor:'#1e1e1e',color:'#d4d4d4',borderTop:'3px solid #007acc',zIndex:1000}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 16px',backgroundColor:'#2d2d30',borderBottom:'1px solid #3e3e42'}}>
        <strong style={{color:'#007acc'}}>🔍 Live Database Operations Log</strong>
        <div>
          <span style={{marginRight:12,fontSize:12,color:'#858585'}}>Total: {logs.length}</span>
          <button onClick={clearLogs} style={{padding:'4px 12px',fontSize:12}}>Clear</button>
        </div>
      </div>
      <div style={{padding:12}}>
        {logs.length === 0 && (
          <div style={{textAlign:'center',padding:20,color:'#858585'}}>
            No operations yet. Perform actions to see live database operations.
          </div>
        )}
        {logs.map(log=> (
          <div key={log.id} style={{marginBottom:12,padding:10,backgroundColor:'#252526',border:'1px solid #3e3e42',borderRadius:4}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
              <span style={{fontWeight:'bold',color:'#4ec9b0'}}>{log.operation}</span>
              <span style={{fontSize:11,color:'#858585'}}>{log.timestamp}</span>
            </div>
            {log.description && (
              <div style={{fontSize:13,color:'#d7ba7d',marginBottom:6}}>💡 {log.description}</div>
            )}
            <div style={{fontSize:12,marginBottom:4}}>
              <strong style={{color:'#569cd6'}}>API:</strong> <span style={{color:'#9cdcfe'}}>{log.endpoint}</span>
            </div>
            <div style={{fontSize:12,marginBottom:4}}>
              <strong style={{color:'#569cd6'}}>File:</strong> <span style={{color:'#ce9178'}}>{log.file}</span>
            </div>
            <div style={{fontSize:12}}>
              <strong style={{color:'#569cd6'}}>SQL:</strong>
              <pre style={{margin:'4px 0 0 0',padding:8,backgroundColor:'#1e1e1e',border:'1px solid #3e3e42',overflow:'auto',fontSize:11,color:'#dcdcaa'}}>{log.sql}</pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
