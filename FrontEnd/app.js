
 // Verifica si se carga el archivo app.js desde index.html
 console.log('Archivo app.js cargado correctamente');

// Espera a que la página se cargue completamente
window.onload = async function() {
    // Verifica si Web3 está disponible en la ventana
    if (typeof window.web3 !== 'undefined') {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      alert('Por favor, instala MetaMask!');
      throw new Error('MetaMask no está instalado');
    }
  
    // Dirección del contrato y ABI
    const contractAddress = '0x5cbbaD264BBdf06F1413050387F7Fe410D19320e'; // Dirección de tu contrato
    const contractABI = [
      // ABI
      {
        "inputs": [
            { "internalType": "uint256", "name": "amountA", "type": "uint256" },
            { "internalType": "uint256", "name": "amountB", "type": "uint256" }
        ],
        "name": "addLiquidity",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "amountA", "type": "uint256" },
            { "internalType": "uint256", "name": "amountB", "type": "uint256" }
        ],
        "name": "removeLiquidity",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "amountAIn", "type": "uint256" }
        ],
        "name": "swapAforB",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "amountBIn", "type": "uint256" }
        ],
        "name": "swapBforA",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "_token", "type": "address" }
        ],
        "name": "getPrice",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }

    ];
  
    // Crea la instancia del contrato
    window.simpleDEX = new web3.eth.Contract(contractABI, contractAddress);
  
    // Obtén la dirección del usuario
    let userAddress = await web3.eth.getAccounts().then(accounts => {
      if (accounts.length > 0) {
        return accounts[0];
      } else {
        alert('No se pudo obtener la dirección del usuario');
        return null;
      }
    });
  
    // Función de intercambio A por B
    window.swapAforB = async function () {
        try {
          // Obtén el valor del input y conviértelo a Wei (o el formato correcto)
          const amountIn = web3.utils.toWei(document.getElementById("amountInput").value, "ether");
      
          // Imprime el valor para asegurarte de que se está pasando correctamente
          console.log("Cantidad a intercambiar:", amountIn);
      
          // Llama a la función del contrato
          const tx = await simpleDEX.methods.swapAforB(amountIn).send({ from: userAddress });
          console.log('Intercambio A por B realizado con éxito', tx);
          alert('Intercambio realizado con éxito');
        } catch (error) {
          console.error('Error al intercambiar A por B:', error);
          alert('Error al intercambiar A por B: ' + error.message);
        }
      };
      
      
  
    // Función de intercambio B por A
    window.swapBforA = async function() {
      if (!userAddress) {
        alert('Por favor, conéctate a MetaMask');
        return;
      }
      try {
        const amountIn = Web3.utils.toWei(document.getElementById("amountInputB").value, "ether");
        console.log("Cantidad a intercambiar B por A:", amountIn);
  
        const tx = await simpleDEX.methods.swapBforA(amountIn).send({ from: userAddress });
        console.log('Intercambio B por A realizado con éxito', tx);
      } catch (error) {
        console.error('Error al intercambiar B por A:', error);
        alert('Error al intercambiar B por A: ' + error.message);
      }
    };
  
    // Función para agregar liquidez
    window.addLiquidity = async function() {
        if (!userAddress) {
          alert('Por favor, conéctate a MetaMask');
          return;
        }
        try {
          // Captura los valores de los inputs
          const amountA = document.getElementById("amountTokenA").value;
          const amountB = document.getElementById("amountTokenB").value;
      
          console.log("Cantidad de Token A capturada:", amountA);
          console.log("Cantidad de Token B capturada:", amountB);
      
          if (!amountA || !amountB) {
            alert("Por favor, ingrese ambos montos.");
            return;
          }
      
          // Conversión de cantidades a Wei (si usas Ether como unidad en los inputs)
          const amountAWei = Web3.utils.toWei(amountA, "ether");
          const amountBWei = Web3.utils.toWei(amountB, "ether");
      
          console.log("Cantidad de Token A en Wei:", amountAWei);
          console.log("Cantidad de Token B en Wei:", amountBWei);
      
          // Llama a la función del contrato para agregar liquidez
          const tx = await simpleDEX.methods.addLiquidity(amountAWei, amountBWei).send({ from: userAddress });
          console.log('Liquidez agregada con éxito', tx);
        } catch (error) {
          console.error('Error al agregar liquidez:', error);
          alert('Error al agregar liquidez: ' + error.message);
        }

    }
  
    // Función para retirar liquidez
    window.removeLiquidity = async function() {
      if (!userAddress) {
        alert('Por favor, conéctate a MetaMask');
        return;
      }
      try {
        // Obtén los valores de los inputs y conviértelos a la unidad correcta (wei)
        const amountA = Web3.utils.toWei(document.getElementById("amountAInput").value, "ether");
        const amountB = Web3.utils.toWei(document.getElementById("amountBInput").value, "ether");
    
        console.log("Cantidad de Token A a retirar:", amountA);
        console.log("Cantidad de Token B a retirar:", amountB);
    
        // Llama a la función del contrato para retirar liquidez
        const tx = await simpleDEX.methods.removeLiquidity(amountA, amountB).send({ from: userAddress });
        console.log('Retiro de liquidez realizado con éxito', tx);
      } catch (error) {
        console.error('Error al retirar liquidez:', error);
        alert('Error al retirar liquidez: ' + error.message);
      }
    }
}; 