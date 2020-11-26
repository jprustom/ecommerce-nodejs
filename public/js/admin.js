const productId=document.querySelector('input[type="hidden"]#productId').value;
const csrfToken=document.querySelector('input[type="hidden"]#csrfToken').value;
const deleteProductBtns=document.querySelectorAll('button#deleteProduct');

deleteProductBtns.forEach(deleteProductBtn=>{
    deleteProductBtn.addEventListener('click',deleteProduct.bind(this,deleteProductBtn))
})

async function deleteProduct(deleteProductBtn){
    const deleteProductResponse=await fetch(`/admin/delete-product/${productId}`,{
        method:'DELETE',
        headers:{
            'csrf-token':csrfToken
        }
    })
    const productDeletedSuccessfully=deleteProductResponse.status===200;
    if (productDeletedSuccessfully)
        removeProductFromDOM(deleteProductBtn);
    
}
function removeProductFromDOM(deleteProductBtn) {
    const productElement = deleteProductBtn.closest('article');
    productElement.parentNode.removeChild(productElement);
}
