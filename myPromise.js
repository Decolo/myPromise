class _Promise {
  constructor(executor) {
    this.status = 'pending'
    this.value = undefined
    this.resolveQueue = []
    this.rejectQueue = []

    let resolve = ret => {
      if (ret instanceof _Promise) {
        return ret.then(resolve, reject).then(this.resolveQueue.shift(), this.rejectQueue.shift())
      }
      if (this.status === 'pending') {
        this.status = 'resolved'
        this.value = ret
        while(this.resolveQueue.length > 0) {
          setTimeout(this.resolveQueue.shift(), 0, this.value)
        }
      }
    }

    let reject = err => {
      if (err instanceof _Promise) {
        return ret.then(resolve, reject).then(this.resolveQueue.shift(), this.rejectQueue.shift())
      }
      if (this.status === 'pending') {
        this.status = 'rejected'
        this.value = err
        while(this.rejectQueue.length > 0) {
          setTimeout(this.rejectQueue.shift(), 0, this.value)
        }
      }
    }

    try{
      executor(resolve, reject)
    } catch(e) {
      reject(e)
    }
  }

  then(onResolved, onRejected) {
    if (this.status === 'resolved') {
      return new _Promise((resolve, reject) => {
        try{
          let result = onResolved(this.value)
          if (result instanceof _Promise) {
            result.then(resolve, reject)
          } else {
            resolve(result)
          }
        } catch(error) {
          reject(error)
        }
      })
    }
    
    if (this.status === 'resolved') {
      return new _Promise((resolve, reject) => {
        try{
          let result = onResolved(this.value)
          if (result instanceof _Promise) {
            result.then(resolve, reject)
          } else {
            resolve(result)
          }
        } catch(error) {
          reject(error)
        }
      })
    }

    if (this.status === 'pending') {
      return new _Promise((resolve, reject) => {
        this.resolveQueue.push(function(val) {
          try{
            let result = onResolved(val)
            if (result instanceof _Promise) {
              result.then(resolve, reject)
            } else {
              resolve(result)
            }
          } catch(error) {
            reject(error)
          }
        })

        this.rejectQueue.push(function(val) {
          try{
            let result = onReject(val)
            if (result instanceof _Promise) {
              result.then(resolve, reject)
            }
            // 前面的错误是无须向后传递的。但是毁掉函数处理错误的过程中发生的错误，是要向后传递的
          } catch(error) {
            reject(error)
          }
        })
      })
    }
  } 
}