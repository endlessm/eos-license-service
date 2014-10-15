jsdir = $(pkgdatadir)
dist_js_DATA = \
	licenseApp.js \
	licenseCrawler.js \
	$(NULL)

EOS_TERMS_PDF = EndlessOS-terms-conditions.pdf
dist_pkgdata_DATA = $(EOS_TERMS_PDF)

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

# Helper rules for regenerating the terms and conditions pdf
EOS_TERMS_URL = https://docs.google.com/a/endlessm.com/document/d/1Nj5yYpTT9BXTNXCKxZXeMgsJ73u9JyFJYQ5gEAFmNOc
download-terms:
	xdg-open "$(EOS_TERMS_URL)" &
	@echo "Export PDF through the 'File->Download as->PDF document (.pdf)' menu"
	@echo "Save the PDF as $(abs_srcdir)/$(EOS_TERMS_PDF)"

FIX_PDF_LINKS = sed -e \
	'/^\/URI /{ \
	  s,(https\?://www.google.com/url?q=,(,; \
	  s,%3A,:,g; \
	  s,%2F,/,g; \
	  s,&sa.*),),; \
	}'
fix-terms-links: $(EOS_TERMS_PDF)
	cp $< $<.orig
	$(FIX_PDF_LINKS) $<.orig > $<
	diff -ua $<.orig $<
	rm $<.orig

.PHONY: download-terms fix-terms-links
