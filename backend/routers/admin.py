import os
import uuid
from typing import Optional
from fastapi import APIRouter, Form, Depends, UploadFile, File, HTTPException, status , Header
from database import get_db

router = APIRouter(prefix='/admin')

# Ensure directory exists on startup
UPLOAD_DIR = 'images'
os.makedirs(UPLOAD_DIR, exist_ok=True)




USERNAME = 'pcstore'
PASSCODE = '1234'



tokens = set()







@router.post('/login')
def login(username : str  = Form(...) , password : str = Form(...)):
  if username != USERNAME or password != PASSCODE :
      raise HTTPException(status_code=401 , detail='invalid credentials')

  else:
    token = str(uuid.uuid4())
    tokens.add(token)
    return {'message':  'login successful' ,  'token' : token}




def verifier(authorization : str =  Header(None)):
    if authorization : 
        
        holder = authorization.split(' ')
        if len(holder) == 2 and holder[0] == 'Bearer' :
            token = holder[1]
            if token in tokens : 
                return token
        


    raise HTTPException(status_code=401 , detail='Missing or invalid token !')



@router.post('/add', status_code=status.HTTP_201_CREATED)
def add_pc(
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    image: Optional[UploadFile] = File(None),
    pc_type: str = Form(...),
    is_available : int = Form(...), 
    db = Depends(get_db), 
    token: str = Depends(verifier)
):
    clean_pc_type = pc_type.lower().strip()
    if clean_pc_type not in ['laptop', 'desktop']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail='pc_type must be either "laptop" or "desktop"'
        )

    file_path = f'{UPLOAD_DIR}/default.png'

    if image and image.filename:
        ext = os.path.splitext(image.filename)[1].lower() or '.jpg'
        file_path = f'{UPLOAD_DIR}/{uuid.uuid4()}{ext}'
        
        with open(file_path, 'wb') as f:
            f.write(image.file.read())


    if is_available not in ('1' , '0') and is_available not in (1 , 0):
        is_available =1 

    cursor = db.cursor()
    cursor.execute(
        'INSERT INTO pcs(name, description, price, image, pc_type , is_available) VALUES (?, ?, ?, ?, ? , ?)',
        (name, description, price, file_path, clean_pc_type , is_available)
    )
    db.commit()

    return {'message': 'Operation successful'}










@router.post('/edit/{ident}' )
def edit(
    ident: int,
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    pc_type: str = Form(...),
    is_available: int = Form(1),  # Fixed: wrapped in Form() to read from FormData
    image: Optional[UploadFile] = File(None),
    db = Depends(get_db) ,
    token: str = Depends(verifier)
):
    cursor = db.cursor()

    # 1. Update image only if a new file was uploaded
    if image and image.filename:
        ext = os.path.splitext(image.filename)[1].lower() or '.jpg'
        file_path = f'{UPLOAD_DIR}/{uuid.uuid4()}{ext}'
        
        with open(file_path, 'wb') as f:
            f.write(image.file.read())
            
        cursor.execute('UPDATE pcs SET image = ? WHERE id = ?', (file_path, ident))

    # 2. Update remaining fields
    cursor.execute(
        'UPDATE pcs SET name = ?, description = ?, price = ?, pc_type = ?, is_available = ? WHERE id = ?',
        (name, description, price, pc_type, is_available, ident)
    )

    # 3. CRITICAL: Commit transaction to persist updates to SQLite
    db.commit()

    return {"status": "success", "message": f"Product #{ident} updated successfully"}










@router.post('/delete/{ident}')
def delete_item(ident: int, db = Depends(get_db) , token: str = Depends(verifier)):
    cursor = db.cursor()

    # 1. Check if product exists
    cursor.execute('SELECT id FROM pcs WHERE id = ?', (ident,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Product not found")

    # 2. Delete row from database
    cursor.execute('DELETE FROM pcs WHERE id = ?', (ident,))
    
    # 3. Commit transaction to save changes
    db.commit()

    return {"status": "success", "message": f"Product #{ident} deleted successfully"}





@router.get('/verify')
def verify_status(token: str = Depends(verifier)):
    return {"status": "valid"}