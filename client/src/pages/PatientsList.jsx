import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

function PatientsList() {
    const [patients, setPatients] = useState([]);
    const [reports, setReports] = useState([]);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchPatients = async () => {
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

        const fetchReports = async () => {
            const response = await fetch('http://localhost:3001/reports', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setReports(data);
        }
        fetchReports();

    }, [token]);

    const handleViewReport = (patient) => {
        const patientReports = reports.filter(report => report.userId === patient.id);

        if (patientReports.length === 0) {
            alert("Aucun rapport trouvé pour ce patient.");
            return;
        }

        const doc = new jsPDF();

        // Header
        doc.setFillColor(255, 138, 0); // Couleur d'arrière-plan similaire à votre site
        doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F'); // Barre supérieure
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.text('CalmedicaCare+', 14, 26);

        // Title
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.text(`Rapports Médicaux de ${patient.name} ${patient.surname}`, 14, 50);

        // Add each report
        let yOffset = 70;
        doc.setFontSize(12);
        patientReports.forEach((report, index) => {
            doc.text(`Sujet: ${report.subject}`, 14, yOffset);
            doc.text(`Description: ${report.description}`, 14, yOffset + 10);
            doc.text(`Créé le: ${new Date(report.createdAt).toLocaleDateString()}`, 14, yOffset + 20);
            doc.text(`Dernière mise à jour: ${new Date(report.updatedAt).toLocaleDateString()}`, 14, yOffset + 30);
            yOffset += 40;

            // Add a line separation between reports
            if (index < patientReports.length - 1) {
                doc.setDrawColor(0, 0, 0); // Black color
                doc.line(10, yOffset, doc.internal.pageSize.width - 10, yOffset);
                yOffset += 10;
            }
        });

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('CalmedicaCare+', 14, doc.internal.pageSize.height - 10);

        doc.save(`rapports_${patient.id}.pdf`);
    };

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
                                {reports.some(report => report.userId === patient.id) ? (
                                    <button
                                        onClick={() => handleViewReport(patient)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
                                    >
                                        Voir Rapport
                                    </button>
                                ) : (
                                    <span>Aucun rapport</span>
                                )}
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