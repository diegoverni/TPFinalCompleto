console.log('Archivo app.js cargado correctamente');

const tokenAAddress = '0x5ebD6016c1b83327F4DFF322bA39A560f7c51569';
const tokenBAddress = '0xd8e5f83c78e4e3e9bE8814D959165460f6bC25CC';

window.onload = async function() {
    if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        window.web3 = new Web3(window.ethereum);
    } else {
        alert('Por favor, instala MetaMask!');
        throw new Error('MetaMask no está instalado');
    }

    const contractAddress = '0x5cbbaD264BBdf06F1413050387F7Fe410D19320e';
    const contractABI = [
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

    window.simpleDEX = new web3.eth.Contract(contractABI, contractAddress);

    let userAddress = await web3.eth.getAccounts().then(accounts => {
        if (accounts.length > 0) {
            return accounts[0];
        } else {
            alert('No se pudo obtener la dirección del usuario');
            return null;
        }
    });

    window.swapAforB = async function() {
      if (!userAddress) {
          alert('Por favor, conéctate a MetaMask');
          return;
      }
      try {
          const amountInputA = document.getElementById("amountInputA").value.trim();
          if (isNaN(amountInputA) || amountInputA <= 0) {
              alert('Por favor, ingrese una cantidad válida para intercambiar');
              return;
          }
          const amountInA = web3.utils.toWei(amountInputA, "ether");
          console.log("Cantidad a intercambiar A por B:", amountInA);
          const tx = await simpleDEX.methods.swapAforB(amountInA).send({ from: userAddress });
          console.log('Intercambio A por B realizado con éxito', tx);
          alert('Intercambio realizado con éxito');
      } catch (error) {
          console.error('Error al intercambiar A por B:', error);
          alert('Error al intercambiar A por B: ' + error.message);
      }
  };

    window.swapBforA = async function() {
        if (!userAddress) {
            alert('Por favor, conéctate a MetaMask');
            return;
        }
        try {
            const amountInputB = document.getElementById("amountInputB").value.trim();
            if (isNaN(amountInputB) || amountInputB <= 0) {
                alert('Por favor, ingrese una cantidad válida para intercambiar');
                return;
            }
            const amountInB = web3.utils.toWei(amountInputB, "ether");
            console.log("Cantidad a intercambiar B por A:", amountInB);
            const tx = await simpleDEX.methods.swapBforA(amountInB).send({ from: userAddress });
            console.log('Intercambio B por A realizado con éxito', tx);
            alert('Intercambio realizado con éxito');
        } catch (error) {
            console.error('Error al intercambiar B por A:', error);
            alert('Error al intercambiar B por A: ' + error.message);
        }
    };

    window.addLiquidity = async function() {
        if (!userAddress) {
            alert('Por favor, conéctate a MetaMask');
            return;
        }
        try {
            const amountA = document.getElementById("amountTokenA").value.trim();
            const amountB = document.getElementById("amountTokenB").value.trim();
            if (isNaN(amountA) || amountA <= 0 || isNaN(amountB) || amountB <= 0) {
                alert("Por favor, ingrese ambos montos válidos.");
                return;
            }
            const amountAWei = web3.utils.toWei(amountA, "ether");
            const amountBWei = web3.utils.toWei(amountB, "ether");
            const tx = await simpleDEX.methods.addLiquidity(amountAWei, amountBWei).send({ from: userAddress });
            console.log('Liquidez agregada con éxito', tx);
            alert('Liquidez agregada con éxito');
        } catch (error) {
            console.error('Error al agregar liquidez:', error);
            alert('Error al agregar liquidez: ' + error.message);
        }
    };

    window.removeLiquidity = async function() {
        if (!userAddress) {
            alert('Por favor, conéctate a MetaMask');
            return;
        }
        try {
            const amountA = document.getElementById("amountAInput").value.trim();
            const amountB = document.getElementById("amountBInput").value.trim();
            if (isNaN(amountA) || amountA <= 0 || isNaN(amountB) || amountB <= 0) {
                alert('Por favor, ingrese ambos montos válidos para retirar liquidez');
                return;
            }
            const amountAWei = web3.utils.toWei(amountA, "ether");
            const amountBWei = web3.utils.toWei(amountB, "ether");
            const tx = await simpleDEX.methods.removeLiquidity(amountAWei, amountBWei).send({ from: userAddress });
            console.log('Retiro de liquidez realizado con éxito', tx);
            alert('Retiro de liquidez realizado con éxito');
        } catch (error) {
            console.error('Error al retirar liquidez:', error);
            alert('Error al retirar liquidez: ' + error.message);
        }
    };

    window.getPrice = async function(tokenAddress) {
      console.log('Llamando a getPrice con dirección:', tokenAddress);
  
      // Verifica si el campo de dirección de Token está vacío o no antes de mostrar el precio
      const customTokenAddress = document.getElementById("tokenAddressInput").value;
      
      if (customTokenAddress === "") {
          document.getElementById("priceDisplayCustom").innerText = "El precio de Token se mostrará aquí.";
      }
  
      try {
          const price = await simpleDEX.methods.getPrice(tokenAddress).call();
          console.log("Precio obtenido:", price);
  
          // Si el token es A, actualiza tanto el precio de A como el de Custom (si hay dirección en el campo)
          if (tokenAddress === tokenAAddress) {
              document.getElementById("priceDisplayA").innerText = `Precio de Token A: ${price}`;
              if (customTokenAddress === tokenAAddress) {
                  document.getElementById("priceDisplayCustom").innerText = `Precio de Token: ${price}`;
              }
          }
          // Si el token es B, actualiza tanto el precio de B como el de Custom (si hay dirección en el campo)
          else if (tokenAddress === tokenBAddress) {
              document.getElementById("priceDisplayB").innerText = `Precio de Token B: ${price}`;
              if (customTokenAddress === tokenBAddress) {
                  document.getElementById("priceDisplayCustom").innerText = `Precio de Token: ${price}`;
              }
          }
          // Si el token es uno personalizado, solo actualiza el precio de Custom (si hay dirección en el campo)
          else if (customTokenAddress !== "") {
              document.getElementById("priceDisplayCustom").innerText = `Precio de Token: ${price}`;
          }
      } catch (error) {
          console.error("Error al obtener el precio:", error);
      }
  };
};