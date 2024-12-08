// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleDEX is Ownable {
    // Direcciones de los tokens A y B
    IERC20 public tokenA;
    IERC20 public tokenB;

    // Variables para el pool de liquidez
    uint256 public reserveA;
    uint256 public reserveB;

    // Eventos
    event LiquidityAdded(address indexed provider, uint256 amountA, uint256 amountB);
    event LiquidityRemoved(address indexed provider, uint256 amountA, uint256 amountB);
    event Swapped(address indexed user, uint256 amountIn, uint256 amountOut);

    // Constructor del contrato
    constructor(address _tokenA, address _tokenB) Ownable(msg.sender) {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    // Función para añadir liquidez al pool
    function addLiquidity(uint256 amountA, uint256 amountB) external onlyOwner {
        require(amountA > 0 && amountB > 0, "Amounts must be greater than 0");

        // Transferir los tokens A y B al contrato
        require(tokenA.transferFrom(msg.sender, address(this), amountA), "Transfer of TokenA failed");
        require(tokenB.transferFrom(msg.sender, address(this), amountB), "Transfer of TokenB failed");

        // Actualizar las reservas del pool
        reserveA += amountA;
        reserveB += amountB;

        emit LiquidityAdded(msg.sender, amountA, amountB);
    }

    // Función para retirar liquidez del pool
    function removeLiquidity(uint256 amountA, uint256 amountB) external onlyOwner {
        require(amountA <= reserveA && amountB <= reserveB, "Not enough liquidity in the pool");

        // Transferir los tokens A y B al propietario
        reserveA -= amountA;
        reserveB -= amountB;
        require(tokenA.transfer(msg.sender, amountA), "Transfer of TokenA failed");
        require(tokenB.transfer(msg.sender, amountB), "Transfer of TokenB failed");

        emit LiquidityRemoved(msg.sender, amountA, amountB);
    }

    // Función para intercambiar TokenA por TokenB
    function swapAforB(uint256 amountAIn) external {
        require(amountAIn > 0, "Amount must be greater than 0");

        // Calcular el precio de intercambio según la fórmula del producto constante
        uint256 amountBOut = getAmountOut(amountAIn, reserveA, reserveB);

        // Asegurarse de que el contrato tenga suficiente liquidez
        require(amountBOut <= reserveB, "Insufficient liquidity in pool");

        // Transferir tokens A desde el usuario al contrato
        require(tokenA.transferFrom(msg.sender, address(this), amountAIn), "Transfer of TokenA failed");

        // Transferir tokens B al usuario
        require(tokenB.transfer(msg.sender, amountBOut), "Transfer of TokenB failed");

        // Actualizar las reservas del pool
        reserveA += amountAIn;
        reserveB -= amountBOut;

        emit Swapped(msg.sender, amountAIn, amountBOut);
    }

    // Función para intercambiar TokenB por TokenA
    function swapBforA(uint256 amountBIn) external {
        require(amountBIn > 0, "Amount must be greater than 0");

        // Calcular el precio de intercambio según la fórmula del producto constante
        uint256 amountAOut = getAmountOut(amountBIn, reserveB, reserveA);

        // Asegurarse de que el contrato tenga suficiente liquidez
        require(amountAOut <= reserveA, "Insufficient liquidity in pool");

        // Transferir tokens B desde el usuario al contrato
        require(tokenB.transferFrom(msg.sender, address(this), amountBIn), "Transfer of TokenB failed");

        // Transferir tokens A al usuario
        require(tokenA.transfer(msg.sender, amountAOut), "Transfer of TokenA failed");

        // Actualizar las reservas del pool
        reserveB += amountBIn;
        reserveA -= amountAOut;

        emit Swapped(msg.sender, amountBIn, amountAOut);
    }

    // Función para calcular la cantidad de tokens de salida (producto constante)
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256) {
        uint256 amountInWithFee = amountIn * 997; // Usamos 0.3% de comisión
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn * 1000 + amountInWithFee;
        return numerator / denominator;
    }

    // Función para obtener el precio de un token en función del pool
    function getPrice(address _token) external view returns (uint256) {
        if (_token == address(tokenA)) {
            return reserveB / reserveA;
        } else if (_token == address(tokenB)) {
            return reserveA / reserveB;
        }
        revert("Invalid token address");
    }
}
