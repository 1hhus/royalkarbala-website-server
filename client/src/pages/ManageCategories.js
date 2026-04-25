import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import '../styles/ManageCategories.css';
import '../styles/Form.css';
import { useTranslation } from 'react-i18next';
import axios from 'axios'
import URL from '../URL';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import EditCategory from '../components/EditCategory';
function ManageCategories() {
    const { t, i18n } = useTranslation();
    const [categories, setCategories] = useState([])
    const [names, setNames] = useState([
        { language: 'ar', value: '' },
        { language: 'en', value: '' },
        { language: 'fa', value: '' },
        { language: 'ur', value: '' },
    ]);
    const [isLoading, setIsLoading] = useState(true)
    const currentLang = i18n.language
    async function loadData() {
        await axios.get(`${URL}/category/all`, {withCredentials:true})
                    .then(res => {
                        const sortedData = res.data.data.sort((a, b) => a.order - b.order); // Sort by order key
                        setCategories(sortedData);
                        setIsLoading(false)
                    })
                    .catch(err => {
                        console.log(err)
                        setIsLoading(false)
                    })
    }

    const [error,setError] = useState('')
    const handleInputChange = (language, value) => {
        setNames(prevNames =>
            prevNames.map(name =>
                name.language === language ? { ...name, value } : name
            )
        );
    };
    useEffect(() => {
        if(isLoading){
            loadData()
        }
    }, [isLoading])

    async function add(data) {
        const emptyField = data.find((name) => !name.value.trim());
        if (emptyField) {
            setError("أرجوك قم بملء جميع الحقول")
            return;
        }

        await axios.post(
                `${URL}/category/add`,
                { names: data },
                { withCredentials: true }
            )
            .then((res) => {
                if (res.status === 201) {
                    window.location.reload();
                }
            })
            .catch((err) => {
                console.log(err);
                setError(err.response?.data?.message || "An error occurred");
            });
    }
    const [isAlertActive, setIsAlertActive] = useState(false)
    const [isEditActive, setIsEditActive] = useState(false)
    const [currentCategoryId, setCurrentCategoryId] = useState('')
    const [currentCategory, setCurrentCategory] = useState('')
    async function deleteData(id) {
        await axios.delete(`${URL}/category/${id}/delete`, {withCredentials:true}) 
                    .then(res => {
                        if(res.status === 200){
                            window.location.reload()
                        }
                    })  
                    .catch(err => {
                        console.log(err)
                        setError(err.response.data.message)
                    })
    }

    async function hide(id){
        await axios.put(`${URL}/category/${id}/hide`, {}, {withCredentials:true})
                    .then(res => {
                        if(res.status === 200){
                            window.location.reload()
                        }
                    })
                    .catch(err => {
                        console.log(err)
                        setError(err.response?.data?.message || "An error occurred");
                    })
    }
    const onDragEnd = async (result) => {
        const { destination, source } = result;
      
        if (!destination) return;
      
        const items = Array.from(categories);
        const [reorderedItem] = items.splice(source.index, 1);
        items.splice(destination.index, 0, reorderedItem);
      
        // Update the order field
        const updatedItems = items.map((item, index) => ({ ...item, order: index }));
        setCategories(updatedItems);
      
        try {
          await axios.put(`${URL}/category/update-order`, { reorderedItems: updatedItems }, { withCredentials: true });
        } catch (error) {
          console.error('Error updating order:', error);
        }
      };
    return (
        <main className="manage-categories">
            <EditCategory activity={isEditActive} cancel={() => setIsEditActive(false)} data={currentCategory} />
            <Alert isActive={isAlertActive} delete={() => deleteData(currentCategoryId)} cancel={() => setIsAlertActive(false)} />
            <div
                className={isAlertActive || isEditActive ? 'blur-container active' : 'blur-container'}
                onClick={() => {
                    setIsEditActive(false);
                    setIsAlertActive(false);
                }}
            ></div>
            <section className="create">
            <form>
                    <div className="field-container">
                        <label>{t('Category Name (Arabic)')}</label>
                        <input
                            name="name-ar"
                            id="name-ar"
                            type="text"
                            value={names.find(name => name.language === 'ar').value}
                            onChange={e => handleInputChange('ar', e.target.value)}
                            required
                        />
                    </div>
                    <div className="field-container">
                        <label>{t('Category Name (English)')}</label>
                        <input
                            name="name-en"
                            id="name-en"
                            type="text"
                            value={names.find(name => name.language === 'en').value}
                            onChange={e => handleInputChange('en', e.target.value)}
                            required
                        />
                    </div>
                    <div className="field-container">
                        <label>{t('Category Name (Persian)')}</label>
                        <input
                            name="name-fa"
                            id="name-fa"
                            type="text"
                            value={names.find(name => name.language === 'fa').value}
                            onChange={e => handleInputChange('fa', e.target.value)}
                            required
                        />
                    </div>
                    <div className="field-container">
                        <label>{t('Category Name (Urdu)')}</label>
                        <input
                            name="name-ur"
                            id="name-ur"
                            type="text"
                            value={names.find(name => name.language === 'ur').value}
                            onChange={e => handleInputChange('ur', e.target.value)}
                            required
                        />
                    </div>
                    <div className="button">
                        <button onClick={(e) => {
                            e.preventDefault()
                            add(names)
                        }}>{t('Add')}</button>
                    </div>
                </form>
                <p className="message error">{error}</p>
            </section>
            <section>
                {isLoading ? (
                    <Loading />
                ) : (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="categories">
                            {(provided) => (
                                <ul {...provided.droppableProps} ref={provided.innerRef}>
                                    {categories.map((d, i) => (
                                        <Draggable key={d._key} draggableId={d._key} index={i}>
                                            {(provided) => (
                                                <li
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={d.isHidden ? 'hidden' : ''}
                                                >
                                                    <div>
                                                        <h4>{d.names.find((n) => n.language === currentLang).value}</h4>
                                                    </div>
                                                    <div className="btns-container">
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                setIsAlertActive(true);
                                                                setCurrentCategoryId(d._key);
                                                            }}
                                                        >
                                                            {t('delete')}
                                                        </button>
                                                        <button
                                                            className="edit"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                setIsEditActive(true);
                                                                setCurrentCategory(d);
                                                            }}
                                                        >
                                                            {t('edit')}
                                                        </button>
                                                        <div
                                                            className="visibilty-btn"
                                                            onClick={() => hide(d._key)}
                                                        >
                                                            {d.isHidden ? <BsEyeSlash /> : <BsEye />}
                                                        </div>
                                                    </div>
                                                </li>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </ul>
                            )}
                        </Droppable>
                    </DragDropContext>
                )}
            </section>
        </main>
    );
}

export default ManageCategories;
