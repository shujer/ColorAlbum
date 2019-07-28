const cloud = require('wx-server-sdk')
// 初始化 cloud
cloud.init()

const db = cloud.database()
const _ = db.command


exports.main = async (event, context) => {
  let {collection, option } = event
  try {
    return await db.collection(collection)
                  .where(option)
                  .remove()
  } catch (e) {
    console.error(e)
  }
}