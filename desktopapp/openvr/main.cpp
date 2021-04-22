#include <stdio.h>
#include <string>
#include <iostream>
#include "openvr/include/openvr.h"
#include <sstream>

using namespace std;
using namespace vr;

void check_error(int line, EVRInitError error) { if (error != 0) printf("%d: error %s\n", line, VR_GetVRInitErrorAsSymbol(error)); }

string applicationRootPath = "";
const string applicationKey = "vrphotobuddy";

string getApplicationRootPath(char **argv) {
	std::string cur_dir(argv[0]);
	int pos = cur_dir.find_last_of("/\\");
	std::string rootDir(cur_dir.substr(0, pos));
	return rootDir;
}

void installManifest(bool cleaninstall = false) {
	cout << "Installing manifest..." << endl;

	std::stringstream ss;
	ss << "" << applicationRootPath << "\\manifest.vrmanifest";
	std::string pathToManifest = ss.str();

	cout << "Checking if already installed..." << endl;

	bool alreadyInstalled = false;
	if (vr::VRApplications()->IsApplicationInstalled(applicationKey.c_str())) {
		cout << "App already installed in SteamVR" << endl;
		alreadyInstalled = true;

		// if (cleaninstall) {
		// 	char buffer[1024];
		// 	auto appError = vr::VRApplicationError_None;
		// 	vr::VRApplications()->GetApplicationPropertyString(applicationKey.c_str(), vr::VRApplicationProperty_WorkingDirectory_String, buffer, 1024, &appError);
		// 	if (appError == vr::VRApplicationError_None) {
		// 		auto oldManifestQPath = QDir::cleanPath(QDir(buffer).absoluteFilePath("manifest.vrmanifest"));
		// 		if (oldManifestQPath.compare(manifestQPath, Qt::CaseInsensitive) != 0) {
		// 			vr::VRApplications()->RemoveApplicationManifest(QDir::toNativeSeparators(oldManifestQPath).toStdString().c_str());
		// 		} else {
		// 			alreadyInstalled = true;
		// 		}
		// 	}
		// } else {
		// 	alreadyInstalled = true;
		// }
	} else {
		cout << "App not installed, adding..." << endl;
		cout << "Path to manifest: " + pathToManifest << endl;

		try {
			auto apperror = vr::VRApplications()->AddApplicationManifest(pathToManifest.c_str());
			if (apperror != vr::VRApplicationError_None) {
				throw std::runtime_error(std::string("Could not add application manifest: ") + std::string(vr::VRApplications()->GetApplicationsErrorNameFromEnum(apperror)));
			} else if (!alreadyInstalled || cleaninstall) {
				cout << "App installed now setting it to autolaunch..." << endl;

				auto apperror = vr::VRApplications()->SetApplicationAutoLaunch(applicationKey.c_str(), true);
				if (apperror != vr::VRApplicationError_None) {
					throw std::runtime_error(std::string("Could not set auto start: ") + std::string(vr::VRApplications()->GetApplicationsErrorNameFromEnum(apperror)));
				}

				cout << "App has been set to autolaunch" << endl;
			}
		} catch (std::exception const& e) {
    		cout << e.what() << endl;
		} catch (...) {
			std::exception_ptr p = std::current_exception();
        	std::clog <<(p ? p.__cxa_exception_type()->name() : "null") << std::endl;
		}
	}
}

int main(int argc, char **argv) { (void) argc; (void) argv;
	EVRInitError error;
	VR_Init(&error, vr::VRApplication_Overlay);
	check_error(__LINE__, error);

	applicationRootPath = getApplicationRootPath(argv);

	cout << "App root path: " << applicationRootPath << endl;

	cout << "Starting up..." << endl;

	installManifest();

	std::stringstream ss;
	ss << "" << applicationRootPath << "\\icon.png";
	std::string pathToPng = ss.str();

	VROverlayHandle_t handle;
	VROverlay()->CreateOverlay ("image", "image", &handle); /* key has to be unique, name doesn't matter */
	VROverlay()->SetOverlayFromFile(handle, pathToPng.c_str());
	VROverlay()->SetOverlayWidthInMeters(handle, 3);
	VROverlay()->ShowOverlay(handle);
	
	cout << "Should be shown" << endl;

	vr::HmdMatrix34_t transform = {
		1.0f, 0.0f, 0.0f, 0.0f,
		0.0f, 1.0f, 0.0f, 1.0f,
		0.0f, 0.0f, 1.0f, -2.0f
	};
	VROverlay()->SetOverlayTransformAbsolute(handle, TrackingUniverseStanding, &transform);

	cout << "Done!" << endl;

	while (true) { }
	return 0;
}