---
title: 目录树组件
---

# 目录树组件

## 通用型展开目录树

### 一、功能介绍：

功能：

1、展开收起

2、单选多选功能

3、任意层级目录子文件/文件夹定制

4、可配置任意层级目录是否支持选中

5、可配置任意层级的新建文件夹功能

### 二、用法示例：

详见：https://git.iflytek.com/pfwang2/deeplearntree

### 三、API：

Tree props

| 属性           | 说明                                                         | 类型    | 默认值                 |
| -------------- | ------------------------------------------------------------ | ------- | ---------------------- |
| show           | 控制目录树组件的显示                                         | Boolean | false                  |
| isMultiple     | 是否支持多选                                                 | Boolean | false                  |
| pageSize       | 每页加载数量                                                 | Number  | 10                     |
| selectMode     | 选择类型                                                     | String  | fileOnly\|dirOnly\|all |
| rootPath       | 根目录请求路径(根目录由http请求获取模式下使用)， 注意：customRootData和rootPath只能设置一个 | String  | null                   |
| customRootData | 自定义根目录，需按照一定结构传入。 注意：customRootData和rootPath只能设置一个 | Array   | []                     |
| displayNew     | 是否有新建功能                                               | Boolean | false                  |
| disableNew     | 新建按钮是否置灰（在displayNew等于true时生效）               | Boolean | false                  |
| creatNewFileFn | 新建文件夹封装函数，用于组件内部新增文件夹时调用             | Funtion |                        |

**customRootData**

```javascript
  [  
		{  
		  title: "test",//必须  
		  type: "folder",//必须  
		  path: `层级1/`,//必须  
		  isLoading: true,//非必须，子目录是否加载完  
		  disableSelect: true,//非必须，是否禁止选中  
		  children: [  
			{  
			  path: `层级1/temp/`,  
			  title: "temp",  
			  type: "folder"  
			},  
			{  
			  path: `层级1/data/`,  
			  title: "data",  
			  type: "folder"  
			},  
			{  
			  path: `层级1/model/`,  
			  title: "model",  
			  type: "folder"  
			}  
		  ]  
		}  
	]
```

**creatNewFileFn**

```javascript
    //@param path 创建的路径  
    //return  新建的结果，返回结果为promise类型  
    creatNewFileFn = async (path) => {  
      //判断文件夹名称是否重复  
      const resp = await isFileExist({ objectKey: path + "/" });  
      //如果不重复再执行新建功能  
      if (!resp) {		  
            const creatRes=await createS3Objects({  
    	    objectKey: path,  
    	    projectId: this.taskData.projectId  
    	})  
    	return creatRes  
      } else {  
    	throw new Error('该目录下存在同名文件！')  
      }  
    }
```


### 四、Tree events:

| 事件名       | 说明                     | 返回值                                                       |
| ------------ | ------------------------ | ------------------------------------------------------------ |
| getSubPaths  | 当发起目录获取请求时触发 | nodeData 当前要请求的目录信息,分为两种情况：1、目录树展开，此时为要展开的节点数据；2、获取更多，这时为当前已展开的节点数据<br/>callback 回传给内部组件已获取数据的函数 |
| selectChange | 选中时触发               | node:当前已点击  <br/>allSelect:所有已选择节点               |

**getSubPaths**

```javascript
   getSubPaths(nodeData, callback) {
      //若需要定制某层级下的数据，则根据nodeData进行判断
      //模拟接口，返回值必须为如下结构
      setTimeout(() => {
        const res = {
          pageNum: nodeData.page,//必须
          pageSize: 3,//必须
          totalNumbers: 10000,//必须
          content: [//必须
            {
              path: `层级1/temp/`,
              title: "temp",
              type: "folder"
            },
            { 
              path: `层级1/data/`,//必须
              title: "data",//必须
              disableSelect: true,//选择
              type: "file"//必须
            },
            {
              path: `层级1/model/`,
              title: "model",
              type: "file"
            }
          ]
        };
        callback(res);
      }, 1000);
    },

    
```
**selectChange**

```javascript
selectChange(node, allSelect) {  
    console.log(node, allSelect);  
}
```



### 五、插槽

作用：在目录树底部添加需要的button等交互



<Vssue :options="{ locale: 'zh' }"/>