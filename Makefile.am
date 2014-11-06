DISTCHECK_CONFIGURE_FLAGS = \
	--with-systemdsystemunitdir=$$dc_install_base/$(systemdsystemunitdir) \
	$(NULL)

jsdir = $(pkgdatadir)
dist_js_DATA = \
	licenseApp.js \
	licenseCrawler.js \
	$(NULL)


eos-license-service.service: eos-license-service.service.in Makefile
	@sed -e "s|\@pkgdatadir\@|$(pkgdatadir)|" $< > $@
systemdsystemunit_DATA = eos-license-service.service
dist_systemdsystemunit_DATA = eos-license-service.socket

EXTRA_DIST = eos-license-service.service.in
CLEANFILES = eos-license-service.service

MAINTAINERCLEANFILES = \
	$(GITIGNORE_MAINTAINERCLEANFILES_TOPLEVEL) \
	$(GITIGNORE_MAINTAINERCLEANFILES_MAKEFILE_IN) \
	$(GITIGNORE_MAINTAINERCLEANFILES_M4_LIBTOOL) \
	$(NULL)

-include $(top_srcdir)/git.mk
