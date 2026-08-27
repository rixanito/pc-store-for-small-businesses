from fastapi import APIRouter, Depends, HTTPException, status
import uuid
from typing import Optional 
from database import get_db

titles = ['id', 'name', 'description', 'price', 'image', 'pc_type', 'is_available', 'created_at']

router = APIRouter(prefix='/pcs')


@router.get('/all')
def get_all(db = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute('SELECT * FROM pcs ORDER BY is_available DESC')
    rows = cursor.fetchall()
    return [dict(zip(titles, i)) for i in rows]


@router.get('/desktops')
def get_desktops(db = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute('SELECT * FROM pcs WHERE LOWER(pc_type) = "desktop" ORDER BY is_available DESC')
    rows = cursor.fetchall()
    return [dict(zip(titles, i)) for i in rows]


@router.get('/laptops')
def get_laptops(db = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute('SELECT * FROM pcs WHERE LOWER(pc_type) = "laptop" ORDER BY is_available DESC')
    rows = cursor.fetchall()
    return [dict(zip(titles, i)) for i in rows]


@router.get('/article/{pc_id}')
def get_single_pc(pc_id: int, db = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute('SELECT * FROM pcs WHERE id = ?', (pc_id,))
    row = cursor.fetchone()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"PC with ID {pc_id} not found"
        )

    return dict(zip(titles, row))

