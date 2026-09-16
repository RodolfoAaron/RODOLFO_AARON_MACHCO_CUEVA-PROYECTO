// === 1. GESTIÓN DEL ALMACENAMIENTO ===
let books = JSON.parse(localStorage.getItem('libraryBooks')) || [];

const bookForm = document.getElementById('book-form');
const booksBody = document.getElementById('books-body');
const searchInput = document.getElementById('search-input');
const filterCategory = document.getElementById('filter-category');
const formMessage = document.getElementById('form-message');
const saleSummary = document.getElementById('sale-summary');

// === 2. EVENTO: REGISTRAR Y VALIDAR UN NUEVO LIBRO ===
bookForm.addEventListener('submit', function(e) {
    e.preventDefault(); 

    // Captura de datos
    const isbn = document.getElementById('isbn').value.trim();
    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const category = document.getElementById('category').value;
    const price = parseFloat(document.getElementById('price').value);
    const stockRaw = parseFloat(document.getElementById('stock').value); 

    // --- BLOQUE DE VALIDACIONES ESTRICTAS ---
    if (isbn === "" || title === "" || author === "" || category === "") {
        showMessage('error', 'Todos los campos son obligatorios. No pueden estar vacíos.');
        return; 
    }

    const isbnRegex = /^[0-9]+$/;
    if (!isbnRegex.test(isbn)) {
        showMessage('error', 'El código/ISBN es inválido. Solo debe contener números.');
        return;
    }

    const autorRegex = /^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!autorRegex.test(author)) {
        showMessage('error', 'El nombre del autor es inválido. Solo debe contener letras.');
        return;
    }

    if (isNaN(price) || price <= 0) {
        showMessage('error', 'El precio debe ser un valor numérico mayor a 0.');
        return;
    }

    if (isNaN(stockRaw) || stockRaw < 0 || !Number.isInteger(stockRaw)) {
        showMessage('error', 'El stock debe ser un número entero mayor o igual a 0 (sin decimales).');
        return;
    }

    const exists = books.some(book => book.isbn === isbn);
    if (exists) {
        showMessage('error', `El ejemplar con el código "${isbn}" ya está en el inventario.`);
        return; 
    }

    // Crear y guardar
    const newBook = {
        isbn: isbn,
        title: title,
        author: author,
        category: category,
        price: price,
        stock: stockRaw
    };

    books.push(newBook);
    saveBooks();
    renderBooks();
    
    bookForm.reset();
    showMessage('success', 'Ejemplar registrado exitosamente en el inventario.');
});

// === 3. FUNCIÓN: MOSTRAR LIBROS ===
function renderBooks(filteredBooks = books) {
    booksBody.innerHTML = ''; 

    if (filteredBooks.length === 0) {
        booksBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 30px; color:#9ca3af;">No se encontraron ejemplares en el catálogo.</td></tr>';
        return;
    }

    filteredBooks.forEach(book => {
        const row = document.createElement('tr');
        const stockDisplay = book.stock > 0 ? book.stock : '<span class="out-of-stock">Agotado</span>';

        row.innerHTML = `
            <td style="color: #d4af37; font-weight: 500;">${book.isbn}</td>
            <td style="font-weight: 500; color: #fff;">${book.title}</td>
            <td>${book.author}</td>
            <td>${book.category}</td>
            <td>S/ ${book.price.toFixed(2)}</td>
            <td>${stockDisplay}</td>
            <td class="sale-action">
                <input type="number" id="qty-${book.isbn}" min="1" max="${book.stock}" step="1" value="1" ${book.stock === 0 ? 'disabled' : ''}>
                <button class="btn btn-success" onclick="sellBook('${book.isbn}')" ${book.stock === 0 ? 'disabled' : ''}>VENDER</button>
            </td>
        `;
        booksBody.appendChild(row);
    });
}

// === 4. LÓGICA DE VENTA ===
function sellBook(isbn) {
    const bookIndex = books.findIndex(b => b.isbn === isbn);
    const book = books[bookIndex];
    const qtyInput = document.getElementById(`qty-${isbn}`);
    const quantityToSell = parseFloat(qtyInput.value); 

    if (isNaN(quantityToSell) || quantityToSell <= 0 || !Number.isInteger(quantityToSell)) {
        alert("Cantidad inválida. Ingrese un número entero mayor a 0.");
        return;
    }

    if (quantityToSell > book.stock) {
        alert(`Operación denegada: Solo dispone de ${book.stock} unidades de "${book.title}".`);
        return;
    }

    const totalSale = quantityToSell * book.price;
    books[bookIndex].stock -= quantityToSell;

    saveBooks();
    renderBooks(getFilteredList());

    saleSummary.innerHTML = `🧾 <strong>Comprobante de Venta:</strong><br>
    Se ha despachado ${quantityToSell} unidad(es) de la obra "<em>${book.title}</em>". <br> 
    <span style="color: #d4af37; font-size: 18px; font-weight: bold; display: inline-block; margin-top: 8px;">Total Procesado: S/ ${totalSale.toFixed(2)}</span>`;
    saleSummary.classList.remove('hidden');
    
    setTimeout(() => { saleSummary.classList.add('hidden'); }, 6000);
}

// === 5. FUNCIONES DE BÚSQUEDA ===
function getFilteredList() {
    const searchTerm = searchInput.value.toLowerCase();
    const categoryTerm = filterCategory.value;

    return books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchTerm) || book.author.toLowerCase().includes(searchTerm);
        const matchesCategory = categoryTerm === "Todas" || book.category === categoryTerm;
        return matchesSearch && matchesCategory;
    });
}

searchInput.addEventListener('input', () => renderBooks(getFilteredList()));
filterCategory.addEventListener('change', () => renderBooks(getFilteredList()));

// === 6. AUXILIARES ===
function saveBooks() {
    localStorage.setItem('libraryBooks', JSON.stringify(books));
}

function showMessage(type, text) {
    formMessage.textContent = text;
    formMessage.className = `message ${type}`;
    formMessage.classList.remove('hidden');
    
    setTimeout(() => { formMessage.classList.add('hidden'); }, 4000);
}

// Iniciar app
renderBooks();
