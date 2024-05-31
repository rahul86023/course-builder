import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FiPlusCircle, FiTrash2, FiEdit, FiLink, FiSave } from 'react-icons/fi';
import { ItemTypes } from './ItemTypes';
import {
  Box,
  Button,
  Container,
  IconButton,
  TextField,
  Typography,
  Paper,
  InputAdornment,
} from '@mui/material';

const initialModules = [
  {
    id: 1,
    name: 'Module 1',
    resources: []
  }
];

const CourseBuilder = () => {
  const [modules, setModules] = useState(initialModules);
  const [editingModule, setEditingModule] = useState(null);
  const [editingResource, setEditingResource] = useState(null);
  const [newLink, setNewLink] = useState({ moduleId: null, url: '' });
  const [editingValue, setEditingValue] = useState('');

  const addModule = () => {
    const newModule = {
      id: Date.now(),
      name: 'New Module',
      resources: []
    };
    setModules([...modules, newModule]);
  };

  const handleFileUpload = (moduleId, file, type) => {
    const reader = new FileReader();
    reader.onload = () => {
      const data = { name: file.name, file: reader.result };
      setModules(prevModules => {
        const updatedModules = prevModules.map(module =>
          module.id === moduleId
            ? { ...module, resources: [...module.resources, { id: Date.now(), type, ...data }] }
            : module
        );
        return updatedModules;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e, moduleId, type) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(moduleId, file, type);
    }
  };

  const deleteResource = (moduleId, resourceId) => {
    const updatedModules = modules.map(module =>
      module.id === moduleId
        ? { ...module, resources: module.resources.filter(resource => resource.id !== resourceId) }
        : module
    );
    setModules(updatedModules);
  };

  const deleteModule = moduleId => {
    const updatedModules = modules.filter(module => module.id !== moduleId);
    setModules(updatedModules);
  };

  const handleEditModule = (moduleId, newName) => {
    const updatedModules = modules.map(module =>
      module.id === moduleId ? { ...module, name: newName } : module
    );
    setModules(updatedModules);
    setEditingModule(null);
  };

  const addLink = (moduleId) => {
    if (newLink.url) {
      const newResource = { id: Date.now(), type: 'link', url: newLink.url };
      setModules(prevModules => {
        const updatedModules = prevModules.map(module =>
          module.id === moduleId
            ? { ...module, resources: [...module.resources, newResource] }
            : module
        );
        return updatedModules;
      });
      setNewLink({ moduleId: null, url: '' });
    }
  };

  const editLink = (moduleId, resourceId, newUrl) => {
    const updatedModules = modules.map(module =>
      module.id === moduleId
        ? {
          ...module,
          resources: module.resources.map(resource =>
            resource.id === resourceId ? { ...resource, url: newUrl } : resource
          )
        }
        : module
    );
    setModules(updatedModules);
    setEditingResource(null);
  };

  const editResourceName = (moduleId, resourceId, newName) => {
    const updatedModules = modules.map(module =>
      module.id === moduleId
        ? {
          ...module,
          resources: module.resources.map(resource =>
            resource.id === resourceId ? { ...resource, name: newName } : resource
          )
        }
        : module
    );
    setModules(updatedModules);
    setEditingResource(null);
  };

  const startEditingModule = (module) => {
    setEditingModule(module.id);
    setEditingValue(module.name);
  };

  const startEditingResource = (resource) => {
    setEditingResource(resource.id);
    setEditingValue(resource.type === 'link' ? resource.url : resource.name);
  };

  const saveEditModule = (moduleId) => {
    handleEditModule(moduleId, editingValue);
    setEditingValue('');
  };

  const saveEditResource = (moduleId, resource) => {
    if (resource.type === 'link') {
      editLink(moduleId, resource.id, editingValue);
    } else {
      editResourceName(moduleId, resource.id, editingValue);
    }
    setEditingValue('');
  };

  const [, drop] = useDrop({
    accept: [ItemTypes.FILE, ItemTypes.IMAGE],
    drop: (item, monitor) => {
      if (monitor.didDrop()) {
        return;
      }
      if (item.type === 'file') {
        handleFileUpload(item.moduleId, item.file, 'file');
      } else if (item.type === 'image') {
        handleFileUpload(item.moduleId, item.file, 'image');
      }
    },
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <Container>
        <Typography variant="h4" gutterBottom>Course Builder</Typography>
        <Button variant="contained" color="primary" startIcon={<FiPlusCircle />} onClick={addModule}>
          Add Module
        </Button>
        <Box ref={drop} mt={2}>
          {modules.map(module => (
            <Paper key={module.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                {editingModule === module.id ? (
                  <>
                    <TextField
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      autoFocus
                    />
                    <IconButton onClick={() => saveEditModule(module.id)}>
                      <FiSave />
                    </IconButton>
                  </>
                ) : (
                  <Typography variant="h6">
                    {module.name}
                    <IconButton onClick={() => startEditingModule(module)}>
                      <FiEdit />
                    </IconButton>
                  </Typography>
                )}
                <IconButton onClick={() => deleteModule(module.id)}>
                  <FiTrash2 />
                </IconButton>
              </Box>
              <Box mt={2}>
                {module.resources.map(resource => (
                  <Box key={resource.id} display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    {resource.type === 'file' && (
                      <Box display="flex" alignItems="center">
                        <a href={resource.file} target="_blank" rel="noopener noreferrer">
                          {resource.name}
                        </a>
                        {editingResource === resource.id ? (
                          <>
                            <TextField
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              autoFocus
                            />
                            <IconButton onClick={() => saveEditResource(module.id, resource)}>
                              <FiSave />
                            </IconButton>
                          </>
                        ) : (
                          <>
                            <IconButton onClick={() => startEditingResource(resource)}>
                              <FiEdit />
                            </IconButton>
                            <IconButton onClick={() => deleteResource(module.id, resource.id)}>
                              <FiTrash2 />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    )}
                    {resource.type === 'image' && (
                      <Box display="flex" alignItems="center">
                        <img src={resource.file} alt={resource.name} style={{ width: '200px', height: '200px' }} />
                        <Typography variant="body1">{resource.name}</Typography>
                        {editingResource === resource.id ? (
                          <>
                            <TextField
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              autoFocus
                            />
                            <IconButton onClick={() => saveEditResource(module.id, resource)}>
                              <FiSave />
                            </IconButton>
                          </>
                        ) : (
                          <>
                            <IconButton onClick={() => startEditingResource(resource)}>
                              <FiEdit />
                            </IconButton>
                            <IconButton onClick={() => deleteResource(module.id, resource.id)}>
                              <FiTrash2 />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    )}
                    {resource.type === 'link' && (
                      <Box display="flex" alignItems="center">
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          {resource.url}
                        </a>
                        {editingResource === resource.id ? (
                          <>
                            <TextField
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              autoFocus
                            />
                            <IconButton onClick={() => saveEditResource(module.id, resource)}>
                              <FiSave />
                            </IconButton>
                          </>
                        ) : (
                          <>
                            <IconButton onClick={() => startEditingResource(resource)}>
                              <FiEdit />
                            </IconButton>
                            <IconButton onClick={() => deleteResource(module.id, resource.id)}>
                              <FiTrash2 />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
              <Box mt={2}>
                <input
                  type="file"
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={e => handleFileInput(e, module.id, 'file')}
                  id={`fileInput-${module.id}`}
                />
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => handleFileInput(e, module.id, 'image')}
                  id={`imageInput-${module.id}`}
                />
                <Button variant="outlined" onClick={() => document.getElementById(`fileInput-${module.id}`).click()}>
                  Add PDF
                </Button>
                <Button variant="outlined" onClick={() => document.getElementById(`imageInput-${module.id}`).click()}>
                  Add Image
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FiLink />}
                  onClick={() => setNewLink({ moduleId: module.id, url: '' })}
                >
                  Add Link
                </Button>
                {newLink.moduleId === module.id && (
                  <Box mt={2}>
                    <TextField
                      value={newLink.url}
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                      placeholder="Enter URL"
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Button onClick={() => addLink(module.id)}>Add</Button>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Box>
                )}
              </Box>
            </Paper>
          ))}
        </Box>
      </Container>
    </DndProvider>
  );
};

export default CourseBuilder;



// import React, { useState } from 'react';
// import { useDrop } from 'react-dnd';
// import { DndProvider } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';
// import { FiPlusCircle, FiTrash2, FiEdit, FiLink } from 'react-icons/fi';
// import { ItemTypes } from './ItemTypes';
// import {
//   Box,
//   Button,
//   Container,
//   IconButton,
//   TextField,
//   Typography,
//   Paper,
//   InputAdornment,
// } from '@mui/material';

// const initialModules = [
//   {
//     id: 1,
//     name: 'Module 1',
//     resources: [
//       { id: 1, type: 'file', file: 'sample.pdf' },
//       { id: 2, type: 'link', name: 'Ex, url: 'https://example.com' }
//     ]
//   },
//   {
//     id: 2,
//     name: 'Module 2',
//     resources: []
//   }
// ];

// const CourseBuilder = () => {
//   const [modules, setModules] = useState(initialModules);
//   const [editingModule, setEditingModule] = useState(null);
//   const [newLink, setNewLink] = useState({ moduleId: null, url: '' });

//   const addModule = () => {
//     const newModule = {
//       id: Date.now(),
//       name: 'New Module',
//       resources: []
//     };
//     setModules([...modules, newModule]);
//   };

//   const handleFileUpload = (moduleId, file, type) => {
//     const reader = new FileReader();
//     reader.onload = () => {
//       const data = { name: file.name, url: reader.result };
//       setModules(prevModules => {
//         const updatedModules = prevModules.map(module =>
//           module.id === moduleId
//             ? { ...module, resources: [...module.resources, { id: Date.now(), type, ...data }] }
//             : module
//         );
//         return updatedModules;
//       });
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleFileInput = (e, moduleId, type) => {
//     const file = e.target.files[0];
//     if (file) {
//       handleFileUpload(moduleId, file, type);
//     }
//   };

//   const deleteResource = (moduleId, resourceId) => {
//     const updatedModules = modules.map(module =>
//       module.id === moduleId
//         ? { ...module, resources: module.resources.filter(resource => resource.id !== resourceId) }
//         : module
//     );
//     setModules(updatedModules);
//   };

//   const deleteModule = moduleId => {
//     const updatedModules = modules.filter(module => module.id !== moduleId);
//     setModules(updatedModules);
//   };

//   const handleEditModule = (moduleId, newName) => {
//     const updatedModules = modules.map(module =>
//       module.id === moduleId ? { ...module, name: newName } : module
//     );
//     setModules(updatedModules);
//     setEditingModule(null);
//   };

//   const addLink = (moduleId) => {
//     if (newLink.url) {
//       const newResource = { id: Date.now(), type: 'link', name: newLink.url, url: newLink.url };
//       setModules(prevModules => {
//         const updatedModules = prevModules.map(module =>
//           module.id === moduleId
//             ? { ...module, resources: [...module.resources, newResource] }
//             : module
//         );
//         return updatedModules;
//       });
//       setNewLink({ moduleId: null, url: '' });
//     }
//   };

//   const editLink = (moduleId, resourceId, newUrl) => {
//     const updatedModules = modules.map(module =>
//       module.id === moduleId
//         ? {
//           ...module,
//           resources: module.resources.map(resource =>
//             resource.id === resourceId ? { ...resource, url: newUrl, name: newUrl } : resource
//           )
//         }
//         : module
//     );
//     setModules(updatedModules);
//   };

//   const editResourceName = (moduleId, resourceId, newName) => {
//     const updatedModules = modules.map(module =>
//       module.id === moduleId
//         ? {
//           ...module,
//           resources: module.resources.map(resource =>
//             resource.id === resourceId ? { ...resource, name: newName } : resource
//           )
//         }
//         : module
//     );
//     setModules(updatedModules);
//   };

//   const [, drop] = useDrop({
//     accept: [ItemTypes.FILE, ItemTypes.IMAGE],
//     drop: (item, monitor) => {
//       if (monitor.didDrop()) {
//         return;
//       }
//       if (item.type === 'file') {
//         handleFileUpload(item.moduleId, item.file, 'file');
//       } else if (item.type === 'image') {
//         handleFileUpload(item.moduleId, item.file, 'image');
//       }
//     },
//   });

//   return (
//     <DndProvider backend={HTML5Backend}>
//       <Container>
//         <Typography variant="h4" gutterBottom>Course Builder</Typography>
//         <Button variant="contained" color="primary" startIcon={<FiPlusCircle />} onClick={addModule}>
//           Add Module
//         </Button>
//         <Box ref={drop} mt={2}>
//           {modules.map(module => (
//             <Paper key={module.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
//               <Box display="flex" alignItems="center" justifyContent="space-between">
//                 {editingModule === module.id ? (
//                   <TextField
//                     value={module.name}
//                     onChange={(e) => handleEditModule(module.id, e.target.value)}
//                     onBlur={() => setEditingModule(null)}
//                     autoFocus
//                   />
//                 ) : (
//                   <Typography variant="h6">
//                     {module.name}
//                     <IconButton onClick={() => setEditingModule(module.id)}>
//                       <FiEdit />
//                     </IconButton>
//                   </Typography>
//                 )}
//                 <IconButton onClick={() => deleteModule(module.id)}>
//                   <FiTrash2 />
//                 </IconButton>
//               </Box>
//               <Box mt={2}>
//                 {module.resources.map(resource => (
//                   <Box key={resource.id} display="flex" alignItems="center" justifyContent="space-between" mb={1}>
//                     {resource.type === 'file' && (
//                       <Box display="flex" alignItems="center">
//                         <TextField
//                           value={resource.name}
//                           onChange={(e) => editResourceName(module.id, resource.id, e.target.value)}
//                           onBlur={() => null}
//                           InputProps={{
//                             endAdornment: (
//                               <InputAdornment position="end">
//                                 <a href={resource.file} target="_blank" rel="noopener noreferrer">
//                                   {resource.name}
//                                 </a>
//                               </InputAdornment>
//                             )
//                           }}
//                         />
//                         <IconButton onClick={() => deleteResource(module.id, resource.id)}>
//                           <FiTrash2 />
//                         </IconButton>
//                       </Box>
//                     )}
//                     {resource.type === 'image' && (
//                       <Box display="flex" alignItems="center">
//                         <img src={resource.url} alt={resource.name} style={{ width: '200px', height: '200px' }} />
//                         <TextField
//                           value={resource.name}
//                           onChange={(e) => editResourceName(module.id, resource.id, e.target.value)}
//                           onBlur={() => null}
//                         />
//                         <IconButton onClick={() => deleteResource(module.id, resource.id)}>
//                           <FiTrash2 />
//                         </IconButton>
//                       </Box>
//                     )}
//                     {resource.type === 'link' && (
//                       <Box display="flex" alignItems="center">
//                         <TextField
//                           value={resource.name}
//                           onChange={(e) => editLink(module.id, resource.id, e.target.value)}
//                           onBlur={() => null}
//                           InputProps={{
//                             endAdornment: (
//                               <InputAdornment position="end">
//                                 <IconButton onClick={() => deleteResource(module.id, resource.id)}>
//                                   <FiTrash2 />
//                                 </IconButton>
//                               </InputAdornment>
//                             )
//                           }}
//                         />
//                         <a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.url}</a>
//                         <IconButton onClick={() => setEditingModule(module.id)}>
//                           <FiEdit />
//                         </IconButton>
//                       </Box>
//                     )}
//                   </Box>
//                 ))}
//               </Box>
//               <Box mt={2}>
//                 <input
//                   type="file"
//                   accept=".pdf"
//                   style={{ display: 'none' }}
//                   onChange={e => handleFileInput(e, module.id, 'file')}
//                   id={`fileInput-${module.id}`}
//                 />
//                 <input
//                   type="file"
//                   accept="image/*"
//                   style={{ display: 'none' }}
//                   onChange={e => handleFileInput(e, module.id, 'image')}
//                   id={`imageInput-${module.id}`}
//                 />
//                 <Button variant="outlined" onClick={() => document.getElementById(`fileInput-${module.id}`).click()}>
//                   Add PDF
//                 </Button>
//                 <Button variant="outlined" onClick={() => document.getElementById(`imageInput-${module.id}`).click()}>
//                   Add Image
//                 </Button>
//                 <Button
//                   variant="outlined"
//                   startIcon={<FiLink />}
//                   onClick={() => setNewLink({ moduleId: module.id, url: '' })}
//                 >
//                   Add Link
//                 </Button>
//                 {newLink.moduleId === module.id && (
//                   <Box mt={2}>
//                     <TextField
//                       value={newLink.url}
//                       onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
//                       placeholder="Enter URL"
//                       fullWidth
//                       InputProps={{
//                         endAdornment: (
//                           <InputAdornment position="end">
//                             <Button onClick={() => addLink(module.id)}>Add</Button>
//                           </InputAdornment>
//                         )
//                       }}
//                     />
//                   </Box>
//                 )}
//               </Box>
//             </Paper>
//           ))}
//         </Box>
//       </Container>
//     </DndProvider>
//   );
// };

// export default CourseBuilder;


