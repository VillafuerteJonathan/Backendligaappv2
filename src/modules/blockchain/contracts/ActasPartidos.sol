// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract ActasPartidos {

    struct Acta {
        bytes32 idPartido;     // hash del UUID
        string hashActa;       // SHA-256 del acta
        string arbitroId;
        string vocalId;
        uint8 golesLocal;
        uint8 golesVisitante;
        uint256 timestamp;
    }

    mapping(bytes32 => Acta) private actas;

    event ActaRegistrada(
        bytes32 idPartido,
        string hashActa,
        string arbitroId,
        string vocalId,
        uint8 golesLocal,
        uint8 golesVisitante,
        uint256 timestamp
    );

    function registrarActa(
        bytes32 _idPartido,
        string memory _hashActa,
        string memory _arbitroId,
        string memory _vocalId,
        uint8 _golesLocal,
        uint8 _golesVisitante
    ) public {

        require(actas[_idPartido].timestamp == 0, "Acta ya registrada");

        actas[_idPartido] = Acta({
            idPartido: _idPartido,
            hashActa: _hashActa,
            arbitroId: _arbitroId,
            vocalId: _vocalId,
            golesLocal: _golesLocal,
            golesVisitante: _golesVisitante,
            timestamp: block.timestamp
        });

        emit ActaRegistrada(
            _idPartido,
            _hashActa,
            _arbitroId,
            _vocalId,
            _golesLocal,
            _golesVisitante,
            block.timestamp
        );
    }

    function obtenerActa(bytes32 _idPartido)
        public
        view
        returns (
            bytes32,
            string memory,
            string memory,
            string memory,
            uint8,
            uint8,
            uint256
        )
    {
        Acta memory acta = actas[_idPartido];
        require(acta.timestamp != 0, "Acta no existe");

        return (
            acta.idPartido,
            acta.hashActa,
            acta.arbitroId,
            acta.vocalId,
            acta.golesLocal,
            acta.golesVisitante,
            acta.timestamp
        );
    }
}
