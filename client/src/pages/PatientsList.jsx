import { useEffect, useState } from "react";

function PatientsList() {
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        const fetchPatients = async () => {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const patientsData = data.filter(user => user.role === 'patient');
                setPatients(patientsData);
            } else {
                console.error('Erreur lors de la récupération des utilisateurs');
            }
        };

        fetchPatients();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8 text-center text-orange-600">Liste des Patients</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-orange-500 text-white">
                    <tr>
                        <th className="px-6 py-3 text-left font-medium">Nom</th>
                        <th className="px-6 py-3 text-left font-medium">Prénom</th>
                        <th className="px-6 py-3 text-left font-medium">Date de Naissance</th>
                        <th className="px-6 py-3 text-left font-medium">Rapport</th>
                    </tr>
                    </thead>
                    <tbody>
                    {patients.map((patient) => (
                        <tr key={patient.id} className="bg-white border-b">
                            <td className="px-6 py-4 whitespace-nowrap">{patient.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{patient.surname}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{new Date(patient.Birthdate).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300">Voir Rapport</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default PatientsList;